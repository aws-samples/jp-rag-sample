from typing import Literal

from chain import (
    build_claude_chain,
    build_rinna_chain,
    run_claude_chain,
    run_rinna_chain,
)
from schemas import LLMWithDocReqBody


def llm_with_doc(
    body: LLMWithDocReqBody,
    endpoint_name: str,
    aws_region: str,
    llm_type: Literal["rinna", "claude"] = "rinna",
):
    """chain を使わずに与えられた情報をもとにプロンプトを作成して LLM に投げる"""
    if llm_type == "rinna":
        chain = build_rinna_chain(endpoint_name, aws_region)
        return run_rinna_chain(chain, body)
    elif llm_type == "claude":
        chain = build_claude_chain()
        return run_claude_chain(chain, body)
    raise ValueError(f"unsupported LLM")
