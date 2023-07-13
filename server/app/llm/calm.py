# Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/

import codecs
import json
import os
from typing import Any, Dict, Optional, Tuple

from kendra import KendraIndexRetriever
from langchain import SagemakerEndpoint
from langchain.chains import RetrievalQA
from langchain.llms.sagemaker_endpoint import LLMContentHandler


# playground の場合は instruction と input で分けて入れるのでこちらでは生データとして入力する
class CaLMContentHandler(LLMContentHandler):
    content_type = "application/json"
    accepts = "application/json"

    def transform_input(self, prompt: str, model_kwargs: dict) -> bytes:
        print("prompt: ", prompt)
        input_str = json.dumps(
            {
                "instruction": "",
                "input": prompt.replace("\n", "<NL>"),
                **model_kwargs,
            }
        )
        return input_str.encode("utf-8")

    def transform_output(self, output: bytes) -> str:
        return json.load(codecs.getreader("utf-8")(output))


calm_model_kwargs = {
    "max_new_tokens": 128,
    "temperature": 0.3,
    "do_sample": True,
    "pad_token_id": 0,
    "bos_token_id": 2,
    "eos_token_id": 3,
}
