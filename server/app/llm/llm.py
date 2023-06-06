"""Build utilities of SageMaker endpoint usage
for LangChain
"""
import json
import os
from typing import Dict, Literal, Optional, Tuple

from kendra import KendraIndexRetriever
from langchain import SagemakerEndpoint
from langchain.chains import RetrievalQA
from llm.calm import CaLMContentHandler, calm_model_kwargs
from llm.prompts import calm_prompt, rinna_prompt
from llm.rinna import RinnaContentHandler, rinna_model_kwargs

content_handler_index = {"rinna": RinnaContentHandler, "calm": CaLMContentHandler}
model_kwargs_index = {"rinna": rinna_model_kwargs, "calm": calm_model_kwargs}
prompt_index = {"rinna": rinna_prompt, "calm": calm_prompt}
endpoint_index = {
    "rinna": os.environ["SAGEMAKER_ENDPOINT_NAME"],
    "calm": os.environ["CALM_ENDPOINT_NAME"],
}
RINNA_ENDPOINT_NAME: str = os.environ["SAGEMAKER_ENDPOINT_NAME"]
CALM_ENDPOINT_NAME: str = os.environ["CALM_ENDPOINT_NAME"]


def build_sagemaker_llm_chain(
    kendra_index_id,
    aws_region: str = "ap-northeast-1",
    llm_type: Literal["rinna", "calm"] = "rinna",
):
    """build chain for sagemaker backed LLM"""

    llm = make_sagemaker_backed_llm(aws_region, llm_type=llm_type)
    retriever = KendraIndexRetriever(
        kendraindex=kendra_index_id,
        awsregion=aws_region,
        return_source_documents=True,
    )
    prompt = prompt_index[llm_type]
    chain_type_kwargs = {"prompt": prompt}
    qa = RetrievalQA.from_chain_type(
        llm,
        chain_type="stuff",
        retriever=retriever,
        chain_type_kwargs=chain_type_kwargs,
        return_source_documents=True,
        verbose=True,
    )
    return qa


def run_chain(chain, prompt: str):
    result = chain(prompt)
    return {"answer": result["result"], "source_documents": result["source_documents"]}


def make_sagemaker_backed_llm(
    aws_region: str,
    llm_type: Literal["rinna", "calm"] = "rinna",
) -> SagemakerEndpoint:
    """return sagemaker backed llm"""
    endpoint_name = endpoint_index[llm_type]
    model_kwargs = model_kwargs_index[llm_type]
    ContentHandler = content_handler_index[llm_type]
    content_handler = ContentHandler()
    llm = SagemakerEndpoint(
        endpoint_name=endpoint_name,
        region_name=aws_region,
        model_kwargs=model_kwargs,
        content_handler=content_handler,
    )
    return llm
