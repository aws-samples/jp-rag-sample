# Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/
"""API でのスキーマを定義するモジュール
"""
from typing import List, Literal

from pydantic import BaseModel, Field


class QueryBody(BaseModel):
    query: str
    user_id: str
    query_type: Literal["kendra", "llm"]


class RagQueryBody(BaseModel):
    query: str
    llm_type: Literal["rinna", "calm"] = Field(
        "rinna", description="裏側の LLM として何を使うのか切り替える"
    )


class RinnaModelKwargs(BaseModel):
    max_new_tokens: int = Field(128)
    temperature: float = Field(0.3)
    do_sample: bool = Field(True)
    pad_token_id: int = Field(0)
    bos_token_id: int = Field(2)
    eos_token_id: int = Field(3)


class KendraDocument(BaseModel):
    excerpt: str
    title: str = Field(description="ドキュメントのタイトル. QUESTION_ANSWER の場合は質問文がここに入る想定")
    content: str
    type: Literal["DOCUMENT", "QUESTION_ANSWER", "ANSWER"]


class ChatHistory(BaseModel):
    utterance: str
    type: Literal["AI", "Human"]


class LLMWithDocReqBody(BaseModel):
    userUtterance: str = Field(description="ユーザーの発言内容")
    history: List[ChatHistory] = Field(description="AI とユーザーとのやり取りの履歴")
    documents: List[KendraDocument]
