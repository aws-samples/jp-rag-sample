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

    const functionArn = "arn:aws:lambda:"+region_name+":"+account_id+":function:streamClaude3-" + envName
    
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
}
