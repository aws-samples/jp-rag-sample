# Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# Licensed under the MIT-0 License (https://github.com/aws/mit-0)

"""claude を使った chain を定義するモジュール
"""
import os
from typing import List

from langchain.chains import LLMChain
from langchain.chat_models import ChatAnthropic
from langchain.prompts import PromptTemplate
from schemas import KendraDocument, LLMWithDocReqBody

ANTHROPIC_API_KEY: str = os.environ.get("ANTHROPIC_API_KEY", None)


def build_claude_chain():
    """claude を LLM として利用する場合の Chain の作成"""
    claude = ChatAnthropic(anthropic_api_key=ANTHROPIC_API_KEY)
    prompt = PromptTemplate(
        template="""Human: 資料:
{context}
上記の資料をもとに以下の質問に回答しなさい。[0]の形式で参考にした資料を示しなさい。また資料がないものは「わかりません」と答えなさい。\n質問: 
{question}

Assistant:""",
        input_variables=["context", "question"],
    )
    return LLMChain(llm=claude, prompt=prompt)


def build_claude_chain_without_doc():
    """context が与えられていない場合のプロンプトを使う Chain の作成"""
    claude = ChatAnthropic(anthropic_api_key=ANTHROPIC_API_KEY)
    prompt = PromptTemplate(
        template="""Human: {question}

Assistant:""",
        input_variables=["question"],
    )
    return LLMChain(llm=claude, prompt=prompt)


def run_claude_chain(chain: LLMChain, body: LLMWithDocReqBody):
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
