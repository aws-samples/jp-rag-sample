"""Define types 
"""
from typing import Dict, List, Literal

from pydantic import BaseModel, Field


class QueryBody(BaseModel):
    query: str
    user_id: str
    query_type: Literal["kendra", "llm"]


class SearchCondition(BaseModel):
    hogehoge: str
