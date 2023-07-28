# Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# Licensed under the MIT-0 License (https://github.com/aws/mit-0)"""API でのスキーマを定義するモジュール
"""
from typing import List, Literal

from pydantic import BaseModel, Field


class KendraDocument(BaseModel):
    """Kendra の検索結果"""

    excerpt: str = Field(description="ドキュメントの中身からの抜粋。LLM へのプロンプトにはここの値が使われます。")
    title: str = Field(description="ドキュメントのタイトル. QUESTION_ANSWER の場合は質問文がここに入る想定")
    content: str = Field(description="ドキュメルの本文")
    type: Literal["DOCUMENT", "QUESTION_ANSWER", "ANSWER"] = Field(
        description="ドキュメントの種類"
    )


class ChatHistory(BaseModel):
    """AI とユーザーとのやり取りの履歴"""

    utterance: str = Field(description="ユーザーの発言内容")
    type: Literal["AI", "Human"] = Field(description="発言主体が AI(LLM) か Human (ユーザー)か")


class LLMWithDocReqBody(BaseModel):
    """POST /llm-with-doc でのリクエストボディ"""

    userUtterance: str = Field(description="ユーザーの発言内容")
    history: List[ChatHistory] = Field(description="AI とユーザーとのやり取りの履歴")
    documents: List[KendraDocument] = Field(description="Kendra による検索結果一覧")
