#!/bin/bash

set -eu

STACK_NAME='JpRagSampleStack'

function extract_value {
    echo $1 | jq -r ".Stacks[0].Outputs[] | select(.OutputKey==\"$2\") | .OutputValue"
}

stack_output=`aws cloudformation describe-stacks --stack-name $STACK_NAME --output json`

export VITE_APP_API_ENDPOINT=`extract_value "$stack_output" 'ApiEndpoint'`
export VITE_APP_KENDRA_INDEX_ID=`extract_value "$stack_output" 'KendraIndexId'`
export VITE_APP_REGION=`extract_value "$stack_output" 'Region'`
export VITE_APP_USER_POOL_ID=`extract_value "$stack_output" 'UserPoolId'`
export VITE_APP_USER_POOL_CLIENT_ID=`extract_value "$stack_output" 'UserPoolClientId'`
export VITE_APP_IDENTITY_POOL_ID=`extract_value "$stack_output" 'IdPoolId'`
export VITE_APP_PREDICT_STREAM_FUNCTION_ARN=`extract_value "$stack_output" PredictStreamFunctionArn`
export VITE_APP_SELF_SIGN_UP_ENABLED=`extract_value "$stack_output" SelfSignUpEnabled`
export VITE_APP_MODEL_REGION=`extract_value "$stack_output" ModelRegion`
export VITE_APP_MODEL_IDS=`extract_value "$stack_output" ModelIds`
export VITE_APP_SAMLAUTH_ENABLED=`extract_value "$stack_output" SamlAuthEnabled`
export VITE_APP_SAML_COGNITO_DOMAIN_NAME=`extract_value "$stack_output" SamlCognitoDomainName`
export VITE_APP_SAML_COGNITO_FEDERATED_IDENTITY_PROVIDER_NAME=`extract_value "$stack_output" SamlCognitoFederatedIdentityProviderName`
