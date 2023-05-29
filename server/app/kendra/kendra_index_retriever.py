"""https://github.com/aws-samples/amazon-kendra-langchain-extensions
Chain for question-answering against a vector database
"""
import re
from typing import Any, Dict, List, Optional

import boto3
from langchain.docstore.document import Document
from langchain.schema import BaseRetriever, Document


def clean_result(res_text: str) -> str:
    res = re.sub("\s+", " ", res_text).replace("...", "")
    return res


def get_top_n_results(resp: Dict, count: int):
    """Kendra のレスポンスから必要情報を抜き出す.
    API の形式については以下のドキュメントを参照.
    https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/kendra/client/query.html
    """
    r = resp["ResultItems"][count]
    doc_uri = r["DocumentURI"]
    r_type = r["Type"]
    if r_type == "DOCUMENT" or r_type == "ANSWER":
        doc_title = r["DocumentTitle"]["Text"]
    elif r_type == "QUESTION_ANSWER":
        additional_attribute = list(
            filter(lambda x: x["Key"] == "QuestionText", r["AdditionalAttributes"])
        )[0]
        print(additional_attribute)
        doc_title = additional_attribute["Value"]["TextWithHighlightsValue"]["Text"]
        # doc_title = ""
    else:
        doc_title = ""

    feedback_token = r["FeedbackToken"]
    if (
        r["AdditionalAttributes"]
        and r["AdditionalAttributes"][0]["Key"] == "AnswerText"
    ):
        res_text = r["AdditionalAttributes"][0]["Value"]["TextWithHighlightsValue"][
            "Text"
        ]
    else:
        res_text = r["DocumentExcerpt"]["Text"]
    doc_excerpt = clean_result(res_text)
    combined_text = doc_title + "\n抜粋: \n" + doc_excerpt + "\n"
    return {
        "page_content": combined_text,
        "metadata": {
            "source": doc_uri,
            "title": doc_title,
            "excerpt": doc_excerpt,
            "type": r_type,
            "feedback_token": feedback_token,
            "raw_data": r,
        },
    }


def kendra_query(
    kclient: Any, kquery: str, kcount: int, kindex_id: str, language_code: str = "ja"
):
    response = kclient.query(
        IndexId=kindex_id,
        QueryText=kquery.strip(),
        AttributeFilter={
            "EqualsTo": {
                "Key": "_language_code",
                "Value": {"StringValue": language_code},
            }
        },
    )
    if len(response["ResultItems"]) > kcount:
        r_count = kcount
    else:
        r_count = len(response["ResultItems"])
    docs = [get_top_n_results(response, i) for i in range(0, r_count)]
    return [
        Document(page_content=d["page_content"], metadata=d["metadata"]) for d in docs
    ]


def kendra_client(kindex_id: str, kregion: str):
    kclient = boto3.client("kendra", region_name=kregion)
    return kclient


class KendraIndexRetriever(BaseRetriever):
    """Retriever to retrieve documents from Amazon Kendra index.

    Example:
        .. code-block:: python

            kendraIndexRetriever = KendraIndexRetriever()

    """

    kendraindex: str
    """Kendra index id"""
    awsregion: str
    """AWS region of the Kendra index"""
    k: int
    """Number of documents to query for."""
    return_source_documents: bool
    """Whether source documents to be returned """
    kclient: Any
    """ boto3 client for Kendra. """

    def __init__(self, kendraindex, awsregion, k=3, return_source_documents=False):
        self.kendraindex = kendraindex
        self.awsregion = awsregion
        self.k = k
        self.return_source_documents = return_source_documents
        self.kclient = kendra_client(self.kendraindex, self.awsregion)

    def get_relevant_documents(
        self, query: str, language_code: str = "ja"
    ) -> List[Document]:
        """Run search on Kendra index and get top k documents

        docs = get_relevant_documents('This is my query')
        """
        return kendra_query(
            self.kclient, query, self.k, self.kendraindex, language_code
        )

    async def aget_relevant_documents(self, query: str) -> List[Document]:
        return await super().aget_relevant_documents(query)
