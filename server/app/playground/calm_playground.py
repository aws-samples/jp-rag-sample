import codecs
import json
import os
from typing import Any, Dict, Optional, Tuple

from kendra import KendraIndexRetriever
from langchain import SagemakerEndpoint
from langchain.chains import RetrievalQA
from langchain.llms.sagemaker_endpoint import LLMContentHandler
from langchain.prompts import PromptTemplate

# playground の場合は instruction と input で分けて入れるのでこちらでは生データとして入力する
calm_prompt = PromptTemplate(
    input_variables=["context", "question"],
    template="""{context}#####{question}""",
)


def build_calm_llm_chain(
    input_template: str,
    kendra_index_id: str,
    endpoint_name: str,
    model_kwargs: Dict = None,
    aws_region: str = "ap-northeast-1",
):
    """build chain for sagemaker backed LLM"""
    # calm 特化の config
    if not model_kwargs:
        model_kwargs = {
            "max_new_tokens": 256,
            "temperature": 0.3,
            "do_sample": True,
            "pad_token_id": 0,
            "bos_token_id": 2,
            "eos_token_id": 3,
        }

    class ContentHandler(LLMContentHandler):
        content_type = "application/json"
        accepts = "application/json"

        def transform_input(self, prompt: str, model_kwargs: dict) -> bytes:
            context, question = prompt.split("#####")
            input = input_template.format(context=context, question=question)
            input_str = json.dumps(
                {
                    "instruction": "",
                    "input": input.replace("\n", "<NL>"),
                    **model_kwargs,
                }
            )
            return input_str.encode("utf-8")

        def transform_output(self, output: bytes) -> str:
            return json.load(codecs.getreader("utf-8")(output))

    content_handler = ContentHandler()
    llm = make_sagemaker_backed_llm(
        endpoint_name,
        aws_region,
        content_handler=content_handler,
        model_kwargs=model_kwargs,
    )
    retriever = KendraIndexRetriever(
        kendraindex=kendra_index_id,
        awsregion=aws_region,
        return_source_documents=True,
    )
    chain_type_kwargs = {"prompt": calm_prompt}
    qa = RetrievalQA.from_chain_type(
        llm,
        chain_type="stuff",
        retriever=retriever,
        chain_type_kwargs=chain_type_kwargs,
        return_source_documents=True,
        verbose=True,
    )
    return qa


def make_sagemaker_backed_llm(
    endpoint_name: str,
    aws_region: str,
    content_handler: Any,
    model_kwargs: Optional[Dict[str, float]],
) -> SagemakerEndpoint:
    """return sagemaker backed llm"""
    if not model_kwargs:
        model_kwargs = {}
    llm = SagemakerEndpoint(
        endpoint_name=endpoint_name,
        region_name=aws_region,
        model_kwargs=model_kwargs,
        content_handler=content_handler,
    )
    return llm
