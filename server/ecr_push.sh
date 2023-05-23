#!/bin/bash
# https://gist.github.com/kuntao/1fb71b5e5ec2fbbcdccf3773b0ede50e 参考
IMAGE=$REPOSITORY:latest

echo Please input your AWS_ACCOUNT_ID to deploy
read account_id
echo region?
read region
export AWS_ACCOUNT_ID=${account_id}
export AWS_REGION=${region}
export REPOSITORY="jp-rag-sample"
export IMAGE_TAG="latest"
echo ${AWS_ACCOUNT_ID}
echo ${AWS_REGION}
# docker build
finch build -t ${REPOSITORY} .
aws ecr get-login-password --region $AWS_REGION | finch login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

finch tag $REPOSITORY:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPOSITORY:$IMAGE_TAG
finch push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPOSITORY:$IMAGE_TAG

# # find old image
# OLD_IMAGE_DIGESTS=`aws ecr --region $AWS_REGION list-images --repository-name $REPOSITORY --filter tagStatus=UNTAGGED | jq '.imageIds | map({imageDigest: .imageDigest})'`

# # deleet old images if they exist
# if [ ! "$OLD_IMAGE_DIGESTS" = '[]' ]; then
#   aws ecr --region $AWS_REGION batch-delete-image --repository-name $REPOSITORY --image-ids "$OLD_IMAGE_DIGESTS"
# fi