"""collection of PromptTemplates for each LLM
"""
from langchain.prompts import PromptTemplate

# rinna の場合は instruction と input で分けて入れるのでこちらでは生データとして入力する
rinna_prompt = PromptTemplate(
    input_variables=["context", "question"],
    template="""{context}#####{question}""",
)
