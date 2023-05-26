from kendra import KendraIndexRetriever
from langchain.chains import RetrievalQA
from llm import make_sagemaker_backed_llm, rinna_prompt


def build_sagemaker_llm_chain(
    kendra_index_id, endpoint_name: str, aws_region: str = "ap-northeast-1"
):
    """build chain for sagemaker backed LLM"""
    llm = make_sagemaker_backed_llm(
        endpoint_name,
        aws_region,
        model_kwargs={
            "max_new_tokens": 128,
            "temperature": 0.7,
            "do_sample": True,
            "pad_token_id": 1,
        },
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


def run_chain(chain, prompt: str):
    result = chain(prompt)
    return {"answer": result["result"], "source_documents": result["source_documents"]}
