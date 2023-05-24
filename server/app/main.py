"""main logics for FastAPI
"""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from kendra import KendraIndexRetriever
from schemas import MessageBody

app = FastAPI()

origins = [os.environ["ALLOW_ORIGINS"].split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
REGION = os.environ["AWS_REGION"]
KENDRA_INDEX_ID: str = "851af651-b31b-42b5-bab1-7a64133f29d5"


@app.get("/")
async def root():
    return {"message": "Hello World"}


retriever = KendraIndexRetriever(
    kendraindex=KENDRA_INDEX_ID, awsregion=REGION, return_source_documents=True
)


@app.post("/v1/message")
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
