# Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/
import os
from typing import Literal

from chain import (
    build_claude_chain,
    build_claude_chain_without_doc,
    build_rinna_chain,
    run_claude_chain,
    run_rinna_chain,
)
from langchain.chat_models import ChatAnthropic
from langchain.prompts import PromptTemplate
from schemas import LLMWithDocReqBody

ANTHROPIC_API_KEY: str = os.environ["ANTHROPIC_API_KEY"]
LLM: str = os.environ["LLM"]
if ANTHROPIC_API_KEY and LLM:
    CLAUDE = ChatAnthropic(anthropic_api_key=ANTHROPIC_API_KEY)


prompt = PromptTemplate(
    input_variables=["context", "question"],
    template="""システム: システムは資料から抜粋して質問に答えます。資料にない内容は答えず「わかりません」と答えます。
    {context}\n
\t上記の資料に基づき以下の質問について資料から抜粋して解答を行います。"
\t資料にない内容は答えず「わかりません」と答えます。\n",
ユーザー: {question}
""",
)
from schemas import LLMWithDocReqBody


def llm_with_doc(
    body: LLMWithDocReqBody,
    endpoint_name: str,
    aws_region: str,
    llm_type: Literal["rinna", "claude"] = "rinna",
):
    """chain を使わずに与えられた情報をもとにプロンプトを作成して LLM に投げる"""
    if llm_type == "rinna":
        chain = build_rinna_chain(endpoint_name, aws_region)
        return run_rinna_chain(chain, body)
    elif llm_type == "claude":
        if body.documents:
            chain = build_claude_chain()
        else:
            chain = build_claude_chain_without_doc()
        return run_claude_chain(chain, body)
    raise ValueError(f"unsupported LLM")
