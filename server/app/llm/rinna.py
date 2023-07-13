# Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/

import json
import os
from typing import Dict, Optional, Tuple

from langchain.llms.sagemaker_endpoint import LLMContentHandler

rinna_model_kwargs = {
    "max_new_tokens": 256,
    "temperature": 0.3,
    "do_sample": True,
    "pad_token_id": 0,
    "bos_token_id": 2,
    "eos_token_id": 3,
}


class RinnaContentHandler(LLMContentHandler):
    content_type = "application/json"
    accepts = "application/json"

    def transform_input(self, prompt: str, model_kwargs: dict) -> bytes:
        input_str = json.dumps(
            {
                "instruction": "",
                "input": prompt.replace("\n", "<NL>"),
                **model_kwargs,
            }
        )
        print("prompt: ", prompt)
        return input_str.encode("utf-8")

    def transform_output(self, output: bytes) -> str:
        response_json = json.loads(output.read().decode("utf-8"))
        return response_json.replace("<NL>", "\n")
