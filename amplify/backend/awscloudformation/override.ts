// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import { AmplifyProjectInfo, AmplifyRootStackTemplate } from '@aws-amplify/cli-extensibility-helper';

export function override(resources: AmplifyRootStackTemplate, amplifyProjectInfo: AmplifyProjectInfo) {
    const authRole = resources.authRole;

    const basePolicies = Array.isArray(authRole.policies)
        ? authRole.policies
        : [authRole.policies];

    // amplify add で追加した Lambda 関数の ARN を取得する
    const envName = amplifyProjectInfo.envName;

    // 開発中の環境からデプロイ先のリージョン名を取得
    const fs = require("fs");
    const amplify_meta_json = JSON.parse(fs.readFileSync("amplify/team-provider-info.json"));
    const region_name = amplify_meta_json[envName].awscloudformation.Region;

    // arnから抽出してデプロイ先の Account ID を取得
    const authRoleArn = amplify_meta_json[envName].awscloudformation.AuthRoleArn;
    const account_id = authRoleArn.split(':')[4];

    const functionArn = "arn:aws:lambda:" + region_name + ":" + account_id + ":function:streamClaude3-" + envName

    // claude stream func　Lambda の Invoke権限を追加
    authRole.policies = [
        ...basePolicies,
        {
            policyName: "amplify-permissions-custom-resources",
            policyDocument: {
                Version: "2012-10-17",
                Statement: [
                    {
                        Resource: functionArn,
                        Action: [
                            "lambda:InvokeFunction"
                        ],
                        Effect: "Allow",
                    },
                ],
            },
        },
    ];

  // .env ファイルを読み込む
  let envContent = fs.readFileSync('.env', 'utf-8');

  // STREAM_FUNC_ARN の値を更新または追加
  const streamFuncArnPattern = /^VITE_STREAM_FUNC_NAME=.*/gm;
  if (streamFuncArnPattern.test(envContent)) {
    envContent = envContent.replace(streamFuncArnPattern, `VITE_STREAM_FUNC_NAME=streamClaude3-${envName}`);
  } else {
    envContent += `\nVITE_STREAM_FUNC_NAME=streamClaude3-${envName}`;
  }

  // VITE_MODEL_ID の値を追加
  const modelId = "anthropic.claude-3-haiku-20240307-v1:0"
  const modelIdPattern = /^VITE_MODEL_ID=.*/gm;
  if (modelIdPattern.test(envContent)) {
    envContent = envContent.replace(modelIdPattern, `VITE_MODEL_ID=${modelId}`);
  } else {
    envContent += `\nVITE_MODEL_ID=${modelId}`;
  }

  // VITE_BEDROCK_REGION の値を追加
  const bedrockRegionPattern = /^VITE_BEDROCK_REGION=.*/gm;
  if (bedrockRegionPattern.test(envContent)) {
    envContent = envContent.replace(bedrockRegionPattern, `VITE_BEDROCK_REGION=${region_name}`);
  } else {
    envContent += `\nVITE_BEDROCK_REGION=${region_name}`;
  }

  // .env ファイルに書き込む
  fs.writeFileSync('.env', envContent);
}
