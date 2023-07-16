# Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/
""" S3 url を presigned url に変換するモジュール
"""
import boto3
from botocore.exceptions import NoCredentialsError


def convert_presigned_url(data):
    """ S3 url を presigned url に変換する
    """
    s3_client = boto3.client('s3')

    if s3_client and data and 'ResultItems' in data:
        for result in data['ResultItems']:
            if 'DocumentURI' in result:
                try:
                    res = result['DocumentURI'].split("/")
                    if res[2].startswith("s3"):
                        # バケット名と key 名 を分離
                        bucket = res[3]
                        key = res[4]
                        for i in range(5, len(res)):
                            key = key + "/" + res[i]
                        # s3 presigned url に置き換え
                        try:
                            uri = s3_client.generate_presigned_url(
                                'get_object', Params={'Bucket': bucket, 'Key': key}, ExpiresIn=3600)
                            result['DocumentURI'] = uri
                        except NoCredentialsError:
                            # credential が無い場合は無視
                            pass
                except IndexError:
                    # pythonのデータ構造上のエラーは無視
                    pass
    return data


if __name__ == '__main__':
    # kendra query
    REGION = "us-west-2"
    INDEX_ID = "xxxx"
    kendra_client = boto3.client("kendra", region_name=REGION)
    request_body = {"AttributeFilter": {"AndAllFilters": [{"EqualsTo": {"Key": "_language_code", "Value": {"StringValue": "ja"}}}]}, "IndexId": INDEX_ID, "PageNumber": 1, "PageSize": 10, "QueryText": "kendra"}
    
    # test
    response = kendra_client.query(**request_body)
    print(convert_presigned_url(response))