"""the handler for Kendra
"""
import re
from typing import Any, Dict

import boto3


def clean_result(res_text: str)-> str:
    res = re.sub("\s+", " ", res_text).replace("...","")
    return res

def get_top_n_results(resp: Dict, count: int):
    r = resp["ResultItems"][count]
    doc_title = r["DocumentTitle"]["Text"]
    doc_uri = r["DocumentURI"]
    r_type = r["Type"]
    if (r["AdditionalAttributes"] and r["AdditionalAttributes"][0]["Key"] == "AnswerText"):
        res_text = r["AdditionalAttributes"][0]["Value"]["TextWithHighlightsValue"]["Text"]
    else:
        res_text = r["DocumentExcerpt"]["Text"]
    doc_excerpt = clean_result(res_text)
    combined_text = "Document Title: " + doc_title + "\nDocument Excerpt: \n" + doc_excerpt + "\n"
    return {"page_content":combined_text, "metadata":{"source":doc_uri, "title": doc_title, "excerpt": doc_excerpt, "type": r_type}}

def kendra_query(kclient: Any, kquery: str, kcount, kindex_id):
    response = kclient.query(IndexId=kindex_id, QueryText=kquery.strip())
    if len(response["ResultItems"]) > kcount:
        r_count = kcount
    else:
        r_count = len(response["ResultItems"])
    docs = [get_top_n_results(response, i) for i in range(0, r_count)]
    return [Document(page_content = d["page_content"], metadata = d["metadata"]) for d in docs]

def kendra_client(kindex_id: str, kregion: str):
    kclient = boto3.client('kendra', region_name=kregion)
    return kclient

