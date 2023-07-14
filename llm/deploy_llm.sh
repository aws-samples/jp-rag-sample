#!/bin/bash

# Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/

git clone https://github.com/aws-samples/aws-ml-jp.git /tmp/aws-ml-jp
cd /tmp/aws-ml-jp/tasks/generative-ai/text-to-text/fine-tuning/instruction-tuning/Transformers/scripts
tar -czvf ../package.tar.gz *
cd ..
pip3 install sagemaker
python3 <<EOF
import sagemaker, boto3, json
from sagemaker.pytorch.model import PyTorchModel
from sagemaker.serializers import JSONSerializer

role = sagemaker.get_execution_role()
sess = sagemaker.Session()
bucket = sess.default_bucket()
region = sess._region_name

model_path = sess.upload_data('package.tar.gz', bucket=bucket, key_prefix=f"Rinna-Inference")
model_path

endpoint_name = "Rinna-Inference"
huggingface_model = PyTorchModel(
    model_data=model_path,
    framework_version="2.0",
    py_version='py310',
    role=role,
    name=endpoint_name,
    env={
        "model_params": json.dumps({
            "base_model": "rinna/japanese-gpt-neox-3.6b-instruction-ppo",
            "peft": False,
            "prompt_template": "rinna",
        }),
        "SAGEMAKER_MODEL_SERVER_TIMEOUT": "3600"
    }
)

# deploy model to SageMaker Inference
predictor = huggingface_model.deploy(
    initial_instance_count=1,
    instance_type='ml.g4dn.xlarge',
    endpoint_name=endpoint_name,
    serializer=JSONSerializer()
)
EOF