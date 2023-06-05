import json
import os
from typing import Dict, List, Optional, Tuple

from langchain import SagemakerEndpoint
from langchain.chains import LLMChain
from langchain.llms.sagemaker_endpoint import LLMContentHandler
from langchain.prompts import PromptTemplate
from schemas import KendraDocument, LLMWithDocReqBody

prompt = PromptTemplate(
    input_variables=["context", "question"],
    template="""システム: システムは資料から抜粋して質問に答えます。資料にない内容は答えず「わかりません」と答えます。
    {context}\n
\t上記の資料に基づき以下の質問について資料から抜粋して解答を行います。"
\t資料にない内容は答えず「わかりません」と答えます。\n",
ユーザー: {question}
""",
)


class ContentHandler(LLMContentHandler):
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


def llm_with_doc(body: LLMWithDocReqBody, endpoint_name: str, aws_region: str):
    """chain を使わずに与えられた情報をもとにプロンプトを作成して LLM に投げる"""
    content_handler = ContentHandler()
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
    context = _make_context_from_docs(body.documents)
    return chain.run(context=context, question=body.userUtterance)


def _make_context_from_docs(documents: List[KendraDocument]):
    context: str = ""
    for doc in documents:
        context += f"\t{doc.title}\n\t\t抜粋: {doc.excerpt}\n"
    return context
