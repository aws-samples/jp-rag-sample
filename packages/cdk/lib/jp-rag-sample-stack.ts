import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Auth, Api, Web, Rag, CommonWebAcl } from './construct';
import { CfnWebACLAssociation } from 'aws-cdk-lib/aws-wafv2';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';

const errorMessageForBooleanContext = (key: string) => {
  return `${key} の設定でエラーになりました。原因として考えられるものは以下です。
 - cdk.json の変更ではなく、-c オプションで設定しようとしている
 - cdk.json に boolean ではない値を設定している (例: "true" ダブルクォートは不要)
 - cdk.json に項目がない (未設定)`;
};

interface JpRagSampleStackProps extends StackProps {
  webAclId?: string;
  allowedIpV4AddressRanges: string[] | null;
  allowedIpV6AddressRanges: string[] | null;
  allowedCountryCodes: string[] | null;
  vpcId?: string;
  cert?: ICertificate;
  hostName?: string;
  domainName?: string;
  hostedZoneId?: string;
}

export class JpRagSampleStack extends Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props: JpRagSampleStackProps) {
    super(scope, id, props);

    const selfSignUpEnabled: boolean =
      this.node.tryGetContext('selfSignUpEnabled')!;
    const allowedSignUpEmailDomains: string[] | null | undefined =
      this.node.tryGetContext('allowedSignUpEmailDomains');
    const samlAuthEnabled: boolean =
      this.node.tryGetContext('samlAuthEnabled')!;
    const samlCognitoDomainName: string = this.node.tryGetContext(
      'samlCognitoDomainName'
    )!;
    const samlCognitoFederatedIdentityProviderName: string =
      this.node.tryGetContext('samlCognitoFederatedIdentityProviderName')!;

    if (typeof selfSignUpEnabled !== 'boolean') {
      throw new Error(errorMessageForBooleanContext('selfSignUpEnabled'));
    }

    if (typeof samlAuthEnabled !== 'boolean') {
      throw new Error(errorMessageForBooleanContext('samlAuthEnabled'));
    }

    const auth = new Auth(this, 'Auth', {
      selfSignUpEnabled,
      allowedIpV4AddressRanges: props.allowedIpV4AddressRanges,
      allowedIpV6AddressRanges: props.allowedIpV6AddressRanges,
      allowedSignUpEmailDomains,
      samlAuthEnabled,
    });

    const api = new Api(this, 'API', {
      userPool: auth.userPool,
      idPool: auth.idPool,
    });

    const rag = new Rag(this, 'Rag', {
      userPool: auth.userPool,
      api: api.api,
    });

    if (
      props.allowedIpV4AddressRanges ||
      props.allowedIpV6AddressRanges ||
      props.allowedCountryCodes
    ) {
      const regionalWaf = new CommonWebAcl(this, 'RegionalWaf', {
        scope: 'REGIONAL',
        allowedIpV4AddressRanges: props.allowedIpV4AddressRanges,
        allowedIpV6AddressRanges: props.allowedIpV6AddressRanges,
        allowedCountryCodes: props.allowedCountryCodes,
      });
      new CfnWebACLAssociation(this, 'ApiWafAssociation', {
        resourceArn: api.api.deploymentStage.stageArn,
        webAclArn: regionalWaf.webAclArn,
      });
      new CfnWebACLAssociation(this, 'UserPoolWafAssociation', {
        resourceArn: auth.userPool.userPoolArn,
        webAclArn: regionalWaf.webAclArn,
      });
    }

    const web = new Web(this, 'Api', {
      apiEndpointUrl: api.api.url,
      kendraIndexId: rag.kendraIndexId,
      userPoolId: auth.userPool.userPoolId,
      userPoolClientId: auth.client.userPoolClientId,
      idPoolId: auth.idPool.identityPoolId,
      predictStreamFunctionArn: api.predictStreamFunction.functionArn,
      selfSignUpEnabled,
      webAclId: props.webAclId,
      modelRegion: api.modelRegion,
      modelIds: api.modelIds,
      samlAuthEnabled,
      samlCognitoDomainName,
      samlCognitoFederatedIdentityProviderName,
      cert: props.cert,
      hostName: props.hostName,
      domainName: props.domainName,
      hostedZoneId: props.hostedZoneId,
    });

    new CfnOutput(this, 'Region', {
      value: this.region,
    });

    if (props.hostName && props.domainName) {
      new CfnOutput(this, 'WebUrl', {
        value: `https://${props.hostName}.${props.domainName}`,
      });
    } else {
      new CfnOutput(this, 'WebUrl', {
        value: `https://${web.distribution.domainName}`,
      });
    }

    new CfnOutput(this, 'ApiEndpoint', {
      value: api.api.url,
    });

    new CfnOutput(this, 'KendraIndexId', {
      value: rag.kendraIndexId,
    });

    new CfnOutput(this, 'UserPoolId', { value: auth.userPool.userPoolId });

    new CfnOutput(this, 'UserPoolClientId', {
      value: auth.client.userPoolClientId,
    });

    new CfnOutput(this, 'IdPoolId', { value: auth.idPool.identityPoolId });

    new CfnOutput(this, 'PredictStreamFunctionArn', {
      value: api.predictStreamFunction.functionArn,
    });

    new CfnOutput(this, 'SelfSignUpEnabled', {
      value: selfSignUpEnabled.toString(),
    });

    new CfnOutput(this, 'ModelRegion', {
      value: api.modelRegion,
    });

    new CfnOutput(this, 'ModelIds', {
      value: JSON.stringify(api.modelIds),
    });

    new CfnOutput(this, 'SamlAuthEnabled', {
      value: samlAuthEnabled.toString(),
    });

    new CfnOutput(this, 'SamlCognitoDomainName', {
      value: samlCognitoDomainName.toString(),
    });

    new CfnOutput(this, 'SamlCognitoFederatedIdentityProviderName', {
      value: samlCognitoFederatedIdentityProviderName.toString(),
    });

    this.userPool = auth.userPool;
    this.userPoolClient = auth.client;
  }
}
