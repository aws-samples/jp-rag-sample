import json
import os
from typing import Any, Dict, Optional, Tuple

from kendra import KendraIndexRetriever
from langchain import SagemakerEndpoint
from langchain.chains import RetrievalQA
from langchain.llms.sagemaker_endpoint import LLMContentHandler
from langchain.prompts import PromptTemplate

# rinna の場合は instruction と input で分けて入れるのでこちらでは生データとして入力する
rinna_prompt = PromptTemplate(
    input_variables=["context", "question"],
    template="""{context}#####{question}""",
)


def build_rinna_llm_chain(
    input_template: str,
    instruction_template: str,
    kendra_index_id: str,
    endpoint_name: str,
    model_kwargs: Dict = None,
    aws_region: str = "ap-northeast-1",
):
    """build chain for sagemaker backed LLM"""
    # rinna 特化の config
    if not model_kwargs:
        model_wargs = {
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
            instruction = instruction_template.format(
                context=context, question=question
            )
            input_str = json.dumps(
                {
                    "instruction": instruction.replace("\n", "<NL>"),
                    "input": input.replace("\n", "<NL>"),
                    **model_kwargs,
                }
            )
            return input_str.encode("utf-8")

        def transform_output(self, output: bytes) -> str:
            response_json = json.loads(output.read().decode("utf-8"))
            return response_json.replace("<NL>", "\n")

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
    chain_type_kwargs = {"prompt": rinna_prompt}
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
