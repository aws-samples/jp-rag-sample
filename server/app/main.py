"""FastAPI の main
"""
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/message")
async def handle_message():
    return {"message": "Good job!!"}


