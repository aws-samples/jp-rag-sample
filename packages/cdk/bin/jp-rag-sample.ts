#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { JpRagSampleStack } from '../lib/jp-rag-sample-stack';
import { CloudFrontWafStack } from '../lib/cloud-front-waf-stack';

const app = new cdk.App();

const allowedIpV4AddressRanges: string[] | null = app.node.tryGetContext(
  'allowedIpV4AddressRanges'
)!;
const allowedIpV6AddressRanges: string[] | null = app.node.tryGetContext(
  'allowedIpV6AddressRanges'
)!;
const allowedCountryCodes: string[] | null = app.node.tryGetContext(
  'allowedCountryCodes'
)!;

// Props for custom domain name
const hostName = app.node.tryGetContext('hostName');
if (
  typeof hostName != 'undefined' &&
  typeof hostName != 'string' &&
  hostName != null
) {
  throw new Error('hostName must be a string');
}
const domainName = app.node.tryGetContext('domainName');
if (
  typeof domainName != 'undefined' &&
  typeof domainName != 'string' &&
  domainName != null
) {
  throw new Error('domainName must be a string');
}
const hostedZoneId = app.node.tryGetContext('hostedZoneId');
if (
  typeof hostedZoneId != 'undefined' &&
  typeof hostedZoneId != 'string' &&
  hostedZoneId != null
) {
  throw new Error('hostedZoneId must be a string');
}

// check hostName, domainName hostedZoneId are all set or none of them
if (
  !(
    (hostName && domainName && hostedZoneId) ||
    (!hostName && !domainName && !hostedZoneId)
  )
) {
  throw new Error(
    'hostName, domainName and hostedZoneId must be set or none of them'
  );
}

let cloudFrontWafStack: CloudFrontWafStack | undefined;

// IP アドレス範囲(v4もしくはv6のいずれか)か地理的制限が定義されている場合のみ、CloudFrontWafStack をデプロイする
if (
  allowedIpV4AddressRanges ||
  allowedIpV6AddressRanges ||
  allowedCountryCodes ||
  hostName
) {
  // WAF v2 は us-east-1 でのみデプロイ可能なため、Stack を分けている
  cloudFrontWafStack = new CloudFrontWafStack(app, 'CloudFrontWafStack', {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: 'us-east-1',
    },
    allowedIpV4AddressRanges,
    allowedIpV6AddressRanges,
    allowedCountryCodes,
    hostName,
    domainName,
    hostedZoneId,
    crossRegionReferences: true,
  });
}

const anonymousUsageTracking: boolean = !!app.node.tryGetContext(
  'anonymousUsageTracking'
);

new JpRagSampleStack(app, 'JpRagSampleStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  webAclId: cloudFrontWafStack?.webAclArn,
  crossRegionReferences: true,
  allowedIpV4AddressRanges,
  allowedIpV6AddressRanges,
  allowedCountryCodes,
  description: anonymousUsageTracking
    ? 'JP RAG Sample (uksb-6g16jk2y91)'
    : undefined,
  cert: cloudFrontWafStack?.cert,
  hostName,
  domainName,
  hostedZoneId,
});
