import { Duration } from 'aws-cdk-lib';
import { Cors, RestApi, ResponseType } from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { IdentityPool } from '@aws-cdk/aws-cognito-identitypool-alpha';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export interface BackendApiProps {
  userPool: UserPool;
  idPool: IdentityPool;
}

export class Api extends Construct {
  readonly api: RestApi;
  readonly predictStreamFunction: NodejsFunction;
  readonly modelRegion: string;
  readonly modelIds: string[];

  constructor(scope: Construct, id: string, props: BackendApiProps) {
    super(scope, id);

    const { idPool } = props;

    // region for bedrock
    const modelRegion = this.node.tryGetContext('modelRegion') || 'us-east-1';

    // Model IDs
    const modelIds: string[] = this.node.tryGetContext('modelIds') || [
      'anthropic.claude-3-haiku-20240307-v1:0',
    ];

    // Validate Model Names
    const supportedModelIds = [
      'anthropic.claude-3-opus-20240229-v1:0',
      'anthropic.claude-3-sonnet-20240229-v1:0',
      'anthropic.claude-3-haiku-20240307-v1:0',
    ];

    for (const modelId of modelIds) {
      if (!supportedModelIds.includes(modelId)) {
        throw new Error(`Unsupported Model Name: ${modelId}`);
      }
    }

    const predictStreamFunction = new NodejsFunction(this, 'PredictStream', {
      runtime: Runtime.NODEJS_18_X,
      entry: './lambda/predictStream.ts',
      timeout: Duration.minutes(15),
      environment: {
        MODEL_REGION: modelRegion,
        MODEL_IDS: JSON.stringify(modelIds),
      },
      bundling: {
        nodeModules: ['@aws-sdk/client-bedrock-runtime'],
      },
    });
    predictStreamFunction.grantInvoke(idPool.authenticatedRole);

    // Bedrock Policy
    const bedrockPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      resources: ['*'],
      actions: ['bedrock:*', 'logs:*'],
    });
    predictStreamFunction.role?.addToPrincipalPolicy(bedrockPolicy);

    const api = new RestApi(this, 'Api', {
      deployOptions: {
        stageName: 'api',
      },
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
      cloudWatchRole: true,
    });

    api.addGatewayResponse('Api4XX', {
      type: ResponseType.DEFAULT_4XX,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
      },
    });

    api.addGatewayResponse('Api5XX', {
      type: ResponseType.DEFAULT_5XX,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
      },
    });

    this.api = api;
    this.predictStreamFunction = predictStreamFunction;
    this.modelRegion = modelRegion;
    this.modelIds = modelIds;
  }
}
