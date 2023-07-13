# Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/

"""collection of PromptTemplates for each LLM
"""
from langchain.prompts import PromptTemplate

rinna_prompt = PromptTemplate(
    input_variables=["context", "question"],
    template=(
        "システム: 以下は、人間と AI の会話です。AI は資料から抜粋して質問に答えます。"
        "資料にない内容は答えず「わかりません」と答えます。"
        "\n{context}\n"
        "上記の資料に基づき以下の質問について資料から抜粋して回答してください。"
        "資料にない内容は答えず「わかりません」と答えてください。\n"
        "ユーザー: {question}"
    ),
)

calm_prompt = PromptTemplate(
    input_variables=["context", "question"],
    template=(
        "Below is an instruction that describes a task, paired with "
        "an input that provides further context."
        "Write a concise response that appropriately completes the request."
        "### Instruction: {question} ### Input: {context} ### Response"
    ),
)
