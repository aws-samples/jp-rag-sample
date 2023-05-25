"""collection of PromptTemplates for each LLM
"""
from langchain.prompts import PromptTemplate

rinna_prompt = PromptTemplate(
    input_variables=["context", "question"],
    template="""
前提
下記は質問とそれに対して根拠になりうる検索結果の一覧です。あなたは誠実な AI となって以下の回答から質問に対する答えの要約を返してください。
-----
質問
{question} 
-----
ドキュメント
{context}

""",
)
