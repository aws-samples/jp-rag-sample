# Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# Licensed under the MIT-0 License (https://github.com/aws/mit-0)
"""claude on Bedrock を使った chain を定義するモジュール
"""
import os
from typing import List

from langchain.chains import LLMChain
from langchain.llms.bedrock import Bedrock
from langchain.prompts import PromptTemplate
from schemas import KendraDocument, LLMWithDocReqBody

model_id = "anthropic.claude-v1"
bedrock_region = os.environ.get("AWS_BEDROCK_REGION", "us-east-1")


def build_claude_bedrock_chain():
    """claude を LLM として利用する場合の Chain の作成"""

    inference_modifier = {
            "max_tokens_to_sample": 500,
            "temperature": 0.85, 
            "top_k": 10, 
            "top_p": 0.85, 
            "stop_sequences": ["\n\nHuman:"] 
           }
    
    claude = Bedrock(
        model_id=model_id,
        region_name=bedrock_region,
        model_kwargs=inference_modifier
    )
    prompt = PromptTemplate(
        template="""Human: 資料:
{context}
上記の資料をもとに以下の質問に回答しなさい。[0]の形式で参考にした資料を示しなさい。また資料がないものは「わかりません」と答えなさい。\n質問: 
{question}

Assistant:""",
        input_variables=["context", "question"],
    )
    return LLMChain(llm=claude, prompt=prompt)


def build_claude_bedrock_chain_without_doc():
    """context が与えられていない場合のプロンプトを使う Chain の作成"""

    inference_modifier = {
            "max_tokens_to_sample": 200,
            "temperature": 0.85, 
            "top_k": 10, 
            "top_p": 0.85, 
            "stop_sequences": ["\n\nHuman:"] 
           }
    
    claude = Bedrock(
        model_id=model_id,
        region_name=bedrock_region,
        model_kwargs=inference_modifier
    )
    prompt = PromptTemplate(
        template="""Human: {question}

Assistant:""",
        input_variables=["question"],
    )
    return LLMChain(llm=claude, prompt=prompt)


def run_claude_bedrock_chain(chain: LLMChain, body: LLMWithDocReqBody):
    """claude の Chain を実行する"""
    return chain.run(
        context=_make_context_for_claude_from_docs(body.documents),
        question=body.userUtterance,
    )


def _make_context_for_claude_from_docs(documents: List[KendraDocument]):
    """与えられた Document 情報から claude のプロンプトに埋め込むための context 情報を作成する"""
    context: str = ""
    for doc_id, doc in enumerate(documents):
        context += f"[{doc_id}]{doc.title}\n{doc.excerpt}\n"
    return context
