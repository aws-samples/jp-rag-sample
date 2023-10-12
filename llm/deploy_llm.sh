#!/bin/bash

# Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# Licensed under the MIT-0 License (https://github.com/aws/mit-0)

pip3 install "sagemaker>=2.168.0"
python3 <<EOF
from sagemaker.jumpstart.model import JumpStartModel

model = JumpStartModel(
    model_id="huggingface-llm-rinna-3-6b-instruction-ppo-bf16",
    model_version="v1.2.0",
    instance_type="ml.g4dn.xlarge"

)
predictor = model.deploy(endpoint_name="Rinna-Inference")
EOF
