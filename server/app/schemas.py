"""Define types 
"""
from typing import Dict, List

from pydantic import BaseModel, Field


class MessageBody(BaseModel):
    message: str
    user_id: str


class SearchCondition(BaseModel):
    hogehoge: str

