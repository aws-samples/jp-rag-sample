"""main logics for FastAPI
"""
import os

from fastapi import FastAPI
from kendra import KendraIndexRetriever
from schemas import MessageBody

app = FastAPI()

REGION = os.environ["AWS_REGION"]
KENDRA_INDEX_ID: str = "851af651-b31b-42b5-bab1-7a64133f29d5"


@app.get("/")
async def root():
    return {"message": "Hello World"}


retriever = KendraIndexRetriever(kendraindex=KENDRA_INDEX_ID,
        awsregion=REGION,
        return_source_documents=True
)

@app.post("/message")
async def handle_message(message: MessageBody):
    query: str = message.message
    response = retriever.get_relevant_documents(query)
    return {
        "results": [
           {
               "page_content": doc.page_content,
               "metadata": doc.metadata,
           } 
           for doc in response
        ]
    }


