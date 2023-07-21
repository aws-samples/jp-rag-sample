import { AmplifyAuthCognitoStackTemplate, AmplifyProjectInfo } from '@aws-amplify/cli-extensibility-helper';

export function override(resources: AmplifyAuthCognitoStackTemplate, amplifyProjectInfo: AmplifyProjectInfo) {
  resources.userPool.userPoolAddOns = { // Set the user pool policies
    advancedSecurityMode: "ENFORCED"
  }
}
