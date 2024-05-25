import { Stack, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  CloudFrontToS3,
  CloudFrontToS3Props,
} from '@aws-solutions-constructs/aws-cloudfront-s3';
import { CfnDistribution, Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { NodejsBuild } from 'deploy-time-build';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';

export interface WebProps {
  apiEndpointUrl: string;
  kendraIndexId: string;
  userPoolId: string;
  userPoolClientId: string;
  idPoolId: string;
  predictStreamFunctionArn: string;
  selfSignUpEnabled: boolean;
  webAclId?: string;
  modelRegion: string;
  modelIds: string[];
  samlAuthEnabled: boolean;
  samlCognitoDomainName: string;
  samlCognitoFederatedIdentityProviderName: string;
  cert?: ICertificate;
  hostName?: string;
  domainName?: string;
  hostedZoneId?: string;
}

export class Web extends Construct {
  public readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props: WebProps) {
    super(scope, id);

    const commonBucketProps: s3.BucketProps = {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
      enforceSSL: true,
    };

    const cloudFrontToS3Props: CloudFrontToS3Props = {
      insertHttpSecurityHeaders: false,
      loggingBucketProps: commonBucketProps,
      bucketProps: commonBucketProps,
      cloudFrontLoggingBucketProps: commonBucketProps,
      cloudFrontDistributionProps: {
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
          },
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
          },
        ],
      },
    };

    if (
      props.cert &&
      props.hostName &&
      props.domainName &&
      props.hostedZoneId
    ) {
      cloudFrontToS3Props.cloudFrontDistributionProps.certificate = props.cert;
      cloudFrontToS3Props.cloudFrontDistributionProps.domainNames = [
        `${props.hostName}.${props.domainName}`,
      ];
    }

    const { cloudFrontWebDistribution, s3BucketInterface } = new CloudFrontToS3(
      this,
      'Web',
      cloudFrontToS3Props
    );

    if (
      props.cert &&
      props.hostName &&
      props.domainName &&
      props.hostedZoneId
    ) {
      // DNS record for custom domain
      const hostedZone = HostedZone.fromHostedZoneAttributes(
        this,
        'HostedZone',
        {
          hostedZoneId: props.hostedZoneId,
          zoneName: props.domainName,
        }
      );
      new ARecord(this, 'ARecord', {
        zone: hostedZone,
        recordName: props.hostName,
        target: RecordTarget.fromAlias(
          new CloudFrontTarget(cloudFrontWebDistribution)
        ),
      });
    }

    if (props.webAclId) {
      const existingCloudFrontWebDistribution = cloudFrontWebDistribution.node
        .defaultChild as CfnDistribution;
      existingCloudFrontWebDistribution.addPropertyOverride(
        'DistributionConfig.WebACLId',
        props.webAclId
      );
    }

    new NodejsBuild(this, 'BuildWeb', {
      assets: [
        {
          path: '../../',
          exclude: [
            '.git',
            '.github',
            '.gitignore',
            '.prettierignore',
            '.prettierrc.json',
            '*.md',
            'LICENSE',
            'docs',
            'imgs',
            'setup-env.sh',
            'node_modules',
            'prompt-templates',
            'packages/cdk/**/*',
            '!packages/cdk/cdk.json',
            'packages/web/dist',
            'packages/web/dev-dist',
            'packages/web/node_modules',
            'browser-extension',
          ],
        },
      ],
      destinationBucket: s3BucketInterface,
      distribution: cloudFrontWebDistribution,
      outputSourceDirectory: './packages/web/dist',
      buildCommands: ['npm ci', 'npm run web:build'],
      buildEnvironment: {
        VITE_APP_API_ENDPOINT: props.apiEndpointUrl,
        VITE_APP_KENDRA_INDEX_ID: props.kendraIndexId,
        VITE_APP_REGION: Stack.of(this).region,
        VITE_APP_USER_POOL_ID: props.userPoolId,
        VITE_APP_USER_POOL_CLIENT_ID: props.userPoolClientId,
        VITE_APP_IDENTITY_POOL_ID: props.idPoolId,
        VITE_APP_PREDICT_STREAM_FUNCTION_ARN: props.predictStreamFunctionArn,
        VITE_APP_SELF_SIGN_UP_ENABLED: props.selfSignUpEnabled.toString(),
        VITE_APP_MODEL_REGION: props.modelRegion,
        VITE_APP_MODEL_IDS: JSON.stringify(props.modelIds),
        VITE_APP_SAMLAUTH_ENABLED: props.samlAuthEnabled.toString(),
        VITE_APP_SAML_COGNITO_DOMAIN_NAME:
          props.samlCognitoDomainName.toString(),
        VITE_APP_SAML_COGNITO_FEDERATED_IDENTITY_PROVIDER_NAME:
          props.samlCognitoFederatedIdentityProviderName.toString(),
      },
    });

    this.distribution = cloudFrontWebDistribution;
  }
}
