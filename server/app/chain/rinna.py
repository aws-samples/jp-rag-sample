# Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/
import json
from typing import List

from langchain import SagemakerEndpoint
from langchain.chains import LLMChain
from langchain.llms.sagemaker_endpoint import LLMContentHandler
from langchain.prompts import PromptTemplate
from schemas import KendraDocument, LLMWithDocReqBody


class RinnaContentHandler(LLMContentHandler):
    """SageMaker 上にホストした rinna のモデルに対しての入出力のハンドリング方法を記載"""

    content_type = "application/json"
    accepts = "application/json"

    def transform_input(self, prompt: str, model_kwargs: dict) -> bytes:
        input_str = json.dumps(
            {
                "instruction": "",
                "input": prompt.replace("\n", "<NL>"),
                **model_kwargs,
            }
        )
        print("prompt: ", prompt)
        return input_str.encode("utf-8")

    def transform_output(self, output: bytes) -> str:
        response_json = json.loads(output.read().decode("utf-8"))
        return response_json.replace("<NL>", "\n")


def build_rinna_chain(endpoint_name: str, aws_region: str) -> LLMChain:
    """rinna を背後に置いた形での chain を"""
    prompt = PromptTemplate(
        input_variables=["context", "question"],
        template="""システム: システムは資料から抜粋して質問に答えます。資料にない内容は答えず「わかりません」と答えます。
    {context}
    上記の資料に基づき以下の質問について資料から抜粋して解答を行います。
    資料にない内容は答えず「わかりません」と答えます。
ユーザー: {question}
""",
    )
    content_handler = RinnaContentHandler()
    llm = SagemakerEndpoint(
        endpoint_name=endpoint_name,
        region_name=aws_region,
        model_kwargs={
            "max_new_tokens": 256,
            "temperature": 0.3,
            "do_sample": True,
            "pad_token_id": 0,
            "bos_token_id": 2,
            "eos_token_id": 3,
        },
        content_handler=content_handler,
    )
    chain = LLMChain(llm=llm, prompt=prompt)
    return chain


def run_rinna_chain(chain: LLMChain, body: LLMWithDocReqBody):
    context = _make_context_for_rinna_from_docs(body.documents)
    return chain.run(context=context, question=body.userUtterance)


def _make_context_for_rinna_from_docs(documents: List[KendraDocument]):
    """与えられた Document 情報から rinna のプロンプトに埋め込むための context 情報を作成する"""
    context: str = ""
    for doc in documents:
        context += f"\t{doc.title}\n\t\t抜粋: {doc.excerpt}\n"
    return context
