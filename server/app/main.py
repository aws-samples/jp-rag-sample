"""main logics for FastAPI
"""
import json
import os
from typing import Dict

import boto3
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from kendra import KendraIndexRetriever
from langchain.chains import RetrievalQA
from llm import build_sagemaker_llm_chain, run_chain
from logics import llm_with_doc
from playground.calm_playground import build_calm_llm_chain
from playground.rinna_playground_chain import build_rinna_llm_chain
from schemas import (
    CalmPlaygroundReqBody,
    LLMWithDocReqBody,
    QueryBody,
    RagQueryBody,
    RinnaPlaygroundReqBody,
)
import json
# jwt validation
from pydantic import BaseSettings
from fastapi_cognito import CognitoAuth, CognitoSettings
from fastapi_cognito import CognitoToken


app = FastAPI()

origins = os.environ["ALLOW_ORIGINS"].split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    # allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
REGION = os.environ["AWS_REGION"]
KENDRA_INDEX_ID: str = os.environ["KENDRA_INDEX_ID"]
ENDPOINT_NAME: str = os.environ["SAGEMAKER_ENDPOINT_NAME"]
CALM_ENDPOINT_NAME: str = os.environ["CALM_ENDPOINT_NAME"]

# jwt validation
class Settings(BaseSettings):
    check_expiration = True
    jwt_header_prefix = "Bearer"
    jwt_header_name = "Authorization"
    userpools = {
        "ja": {
            "region": REGION,
            "userpool_id": os.environ["USERPOOL_ID"],
            "app_client_id": os.environ["APP_CLIENT_ID"]
        },
    }
settings = Settings()
cognito_ja = CognitoAuth(settings=CognitoSettings.from_global_settings(settings))

# kendra
kendra_client = boto3.client("kendra", region_name=REGION)


@app.get("/")
async def root():
    return {"message": "Hello World"}


retriever = KendraIndexRetriever(
    kendraindex=KENDRA_INDEX_ID, awsregion=REGION, return_source_documents=True
)


@app.post("/v1/query")
async def handle_message(body: QueryBody):
    if body.query_type == "kendra":
        query: str = body.query
        response = retriever.get_relevant_documents(query)
        return {
            "results": [
                {
                    "page_content": doc.page_content,
                    "metadata": doc.metadata,
                }
                for doc in response
            ]
        }
    elif body.query_type == "llm":
        CHAIN: RetrievalQA = build_sagemaker_llm_chain(
            kendra_index_id=KENDRA_INDEX_ID,
            aws_region=REGION,
            llm_type="rinna",
        )
        query: str = body.query
        return run_chain(CHAIN, query)
    else:
        raise HTTPException(status_code=404, detail="Invalid query type")


@app.post("/v1/playground/rinna")
async def rinna_playground(body: RinnaPlaygroundReqBody):
    """rinna へのプロンプトエンジニアリングを行う場所"""
    input_template = body.input_template
    instruction_template = body.instruction_template
    model_kwargs = body.model_kwargs.dict()
    chain = build_rinna_llm_chain(
        input_template,
        instruction_template,
        kendra_index_id=KENDRA_INDEX_ID,
        endpoint_name=ENDPOINT_NAME,
        model_kwargs=model_kwargs,
        aws_region=REGION,
    )
    return run_chain(chain, body.query)


@app.post("/v1/playground/calm")
async def calm_playground(body: CalmPlaygroundReqBody):
    """OpenCaLM を LLM とした RetrievalQA の動作確認をする場所"""
    prompt_template = body.prompt_template
    model_kwargs = body.model_kwargs.dict()
    chain = build_calm_llm_chain(
        prompt_template,
        KENDRA_INDEX_ID,
        endpoint_name=CALM_ENDPOINT_NAME,
        model_kwargs=model_kwargs,
        aws_region=REGION,
    )
    return run_chain(chain, body.query)


@app.post("/v2/rag/query")
async def handle_message(body: RagQueryBody):
    """Kendra への検索 + LLM による要約を兼ね備えた API"""
    CHAIN: RetrievalQA = build_sagemaker_llm_chain(
        kendra_index_id=KENDRA_INDEX_ID, aws_region=REGION, llm_type=body.llm_type
    )
    query: str = body.query
    return run_chain(CHAIN, query)


@app.post("/v2/llm-with-doc")
async def llm_with_doc_handler(body: LLMWithDocReqBody, _: CognitoToken = Depends(cognito_ja.auth_required)):
    """LLM に対してドキュメントとチャット履歴を直接渡して返り値をもらう"""
    return llm_with_doc(body, endpoint_name=ENDPOINT_NAME, aws_region=REGION)


@app.post("/v2/kendra/query")
async def kendra_query(body: Dict, _: CognitoToken = Depends(cognito_ja.auth_required)):
    """Kendra の Query API を透過的に叩く"""
    request_body = body["input"]
    response = kendra_client.query(**request_body)
    return response


@app.post("/v2/kendra/send")
async def kendra_send(body: Dict, _: CognitoToken = Depends(cognito_ja.auth_required)):
    """Kendra の SubmitFeedback API を透過的に叩く"""
    kendra_request_body = body["input"]
    response = kendra_client.submit_feedback(**kendra_request_body)
    return response


@app.post("/v2/kendra/describeIndex")
async def kendra_describe(body: Dict, auth: CognitoToken = Depends(cognito_ja.auth_required)):
    """Kendra の DesribeIndex API を透過的に叩く"""
    kendra_request_body = body["input"]
    response = kendra_client.describe_index(**kendra_request_body)
    return response
