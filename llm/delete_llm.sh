#!/bin/bash

# Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# Licensed under the MIT-0 License (https://github.com/aws/mit-0)

pip3 install sagemaker
python3 <<EOF
import sagemaker
from sagemaker.predictor import Predictor
from sagemaker.serializers import JSONSerializer
from sagemaker.deserializers import JSONDeserializer

sess = sagemaker.Session()

endpoint_name = "Rinna-Inference"

predictor = Predictor(
    endpoint_name=endpoint_name,
    sagemaker_session=sess,
    serializer=JSONSerializer(),
    deserializer=JSONDeserializer()
)

predictor.delete_model()
predictor.delete_endpoint()
EOF