import * as kendra from 'aws-cdk-lib/aws-kendra';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { Token, Arn, RemovalPolicy } from 'aws-cdk-lib';
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  LambdaIntegration,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

export interface RagProps {
  userPool: UserPool;
  api: RestApi;
}

/**
 * RAG を実行するためのリソースを作成する
 */
export class Rag extends Construct {
  readonly kendraIndexId: string;

  constructor(scope: Construct, id: string, props: RagProps) {
    super(scope, id);

    const kendraIndexArnInCdkContext =
      this.node.tryGetContext('kendraIndexArn');

    const kendraDataSourceBucketName = this.node.tryGetContext(
      'kendraDataSourceBucketName'
    );

    let kendraIndexArn: string;
    let kendraIndexId: string;
    let dataSourceBucket: s3.IBucket | null = null;

    if (kendraIndexArnInCdkContext) {
      // 既存の Kendra Index を利用する場合
      kendraIndexArn = kendraIndexArnInCdkContext!;
      kendraIndexId = Arn.extractResourceName(
        kendraIndexArnInCdkContext,
        'index'
      );
      // 既存の S3 データソースを利用する場合は、バケット名からオブジェクトを生成
      if (kendraDataSourceBucketName) {
        dataSourceBucket = s3.Bucket.fromBucketName(
          this,
          'DataSourceBucket',
          kendraDataSourceBucketName
        );
      }

      this.kendraIndexId = kendraIndexId;
    } else {
      // 新規に Kendra Index を作成する場合
      const indexRole = new iam.Role(this, 'KendraIndexRole', {
        assumedBy: new iam.ServicePrincipal('kendra.amazonaws.com'),
      });

      indexRole.addToPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: ['*'],
          actions: ['s3:GetObject'],
        })
      );

      indexRole.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess')
      );

      const index = new kendra.CfnIndex(this, 'KendraIndex', {
        name: 'generative-ai-use-cases-index',
        edition: 'DEVELOPER_EDITION',
        roleArn: indexRole.roleArn,

        // トークンベースのアクセス制御を実施
        // 参考: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-kendra-index.html#cfn-kendra-index-usercontextpolicy
        userContextPolicy: 'USER_TOKEN',

        // 認可に利用する Cognito の情報を設定
        userTokenConfigurations: [
          {
            jwtTokenTypeConfiguration: {
              keyLocation: 'URL',
              userNameAttributeField: 'cognito:username',
              groupAttributeField: 'cognito:groups',
              url: `${props.userPool.userPoolProviderUrl}/.well-known/jwks.json`,
            },
          },
        ],
      });

      kendraIndexArn = Token.asString(index.getAtt('Arn'));
      kendraIndexId = index.ref;

      // .pdf や .txt などのドキュメントを格納する S3 Bucket
      dataSourceBucket = new s3.Bucket(this, 'DataSourceBucket', {
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        encryption: s3.BucketEncryption.S3_MANAGED,
        autoDeleteObjects: true,
        removalPolicy: RemovalPolicy.DESTROY,
        objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
        serverAccessLogsPrefix: 'AccessLogs/',
        enforceSSL: true,
      });

      const s3DataSourceRole = new iam.Role(this, 'DataSourceRole', {
        assumedBy: new iam.ServicePrincipal('kendra.amazonaws.com'),
      });

      s3DataSourceRole.addToPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: [`arn:aws:s3:::${dataSourceBucket.bucketName}`],
          actions: ['s3:ListBucket'],
        })
      );

      s3DataSourceRole.addToPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: [`arn:aws:s3:::${dataSourceBucket.bucketName}/*`],
          actions: ['s3:GetObject'],
        })
      );

      s3DataSourceRole.addToPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: [Token.asString(index.getAtt('Arn'))],
          actions: ['kendra:BatchPutDocument', 'kendra:BatchDeleteDocument'],
        })
      );

      const dataSource = new kendra.CfnDataSource(this, 'S3DataSource', {
        indexId: index.ref,
        type: 'S3',
        name: 's3-data-source',
        roleArn: s3DataSourceRole.roleArn,
        languageCode: 'ja',
        dataSourceConfiguration: {
          s3Configuration: {
            bucketName: dataSourceBucket.bucketName,
            inclusionPrefixes: ['docs'],
          },
        },
      });
      dataSource.addDependency(index);

      this.kendraIndexId = index.ref;
    }

    // RAG 関連の API を追加する
    // Lambda
    const kendraFunction = new NodejsFunction(this, 'KendraFunction', {
      runtime: Runtime.NODEJS_18_X,
      entry: './lambda/kendra.ts',
      bundling: {
        // 新しい Kendra の機能を使うため、AWS SDK を明示的にバンドルする
        externalModules: [],
      },
      environment: {
        INDEX_ID: kendraIndexId,
      },
    });
    kendraFunction.role?.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: [kendraIndexArn],
        actions: [
          'kendra:Describe*',
          'kendra:List*',
          'kendra:Query',
          'kendra:GetQuerySuggestions',
          'kendra:SubmitFeedback',
          'kendra:ListDataSources',
        ],
      })
    );
    if (dataSourceBucket) {
      dataSourceBucket.grantRead(kendraFunction);
    }

    // API Gateway
    const authorizer = new CognitoUserPoolsAuthorizer(this, 'Authorizer', {
      cognitoUserPools: [props.userPool],
    });

    const commonAuthorizerProps = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer,
    };

    const kendraResource = props.api.root.addResource('kendra');
    const queryResource = kendraResource.addResource('query');
    queryResource.addMethod(
      'POST',
      new LambdaIntegration(kendraFunction),
      commonAuthorizerProps
    );
    const sendResource = kendraResource.addResource('send');
    sendResource.addMethod(
      'POST',
      new LambdaIntegration(kendraFunction),
      commonAuthorizerProps
    );
    const describeIndexResource = kendraResource.addResource('describeIndex');
    describeIndexResource.addMethod(
      'POST',
      new LambdaIntegration(kendraFunction),
      commonAuthorizerProps
    );
    const listDataSourcesResource =
      kendraResource.addResource('listDataSources');
    listDataSourcesResource.addMethod(
      'POST',
      new LambdaIntegration(kendraFunction),
      commonAuthorizerProps
    );
  }
}
