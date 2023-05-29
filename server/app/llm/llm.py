"""Build utilities of SageMaker endpoint usage
for LangChain
"""
import json
import os
from typing import Dict, Optional, Tuple

from langchain import SagemakerEndpoint
from langchain.llms.sagemaker_endpoint import LLMContentHandler


class ContentHandler(LLMContentHandler):
    content_type = "application/json"
    accepts = "application/json"

    def transform_input(self, prompt: str, model_kwargs: dict) -> bytes:
        context, question = prompt.split("#####")
        input = f"""
AIは資料から抜粋して質問に答えます。資料にない内容は答えず「わかりません」と答えます。
{context}
上記の資料に基づき以下の質問について資料から抜粋して回答してください。資料にない内容は答えず「わかりません」と答えてください。
"""
        input_str = json.dumps(
            {
                "instruction": question.replace("\n", "<NL>"),
                "input": input.replace("\n", "<NL>"),
                **model_kwargs,
            }
        )
        print("prompt: ", prompt)
        return input_str.encode("utf-8")

    def transform_output(self, output: bytes) -> str:
        response_json = json.loads(output.read().decode("utf-8"))
        return response_json.replace("<NL>", "\n")


def make_sagemaker_backed_llm(
    endpoint_name: str, aws_region: str, model_kwargs: Optional[Dict[str, float]]
) -> SagemakerEndpoint:
    """return sagemaker backed llm"""
    if not model_kwargs:
        model_kwargs = {}
    content_handler = ContentHandler()
    llm = SagemakerEndpoint(
        endpoint_name=endpoint_name,
        region_name=aws_region,
        model_kwargs=model_kwargs,
        content_handler=content_handler,
    )
    return llm
