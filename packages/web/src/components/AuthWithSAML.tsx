import React, { useEffect, useState } from 'react';
import App from '../App.tsx';
import { Button, Text } from '@aws-amplify/ui-react';
import { Amplify, Auth } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import { Box, Spinner } from '@chakra-ui/react';

const samlCognitoDomainName: string = import.meta.env
  .VITE_APP_SAML_COGNITO_DOMAIN_NAME;
const samlCognitoFederatedIdentityProviderName: string = import.meta.env
  .VITE_APP_SAML_COGNITO_FEDERATED_IDENTITY_PROVIDER_NAME;

const AuthWithSAML: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 未ログインの場合は、ログイン画面を表示する
  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(() => {
        setAuthenticated(true);
      })
      .catch(() => {
        setAuthenticated(false);
      })
      .finally(() => {
        setLoading(false); // 認証チェックが完了したらローディングを終了
      });
  }, []);

  const signIn = () => {
    Auth.federatedSignIn({
      customProvider: samlCognitoFederatedIdentityProviderName,
    }); // cdk.json の値を指定
  };

  Amplify.configure({
    Auth: {
      region: import.meta.env.VITE_APP_REGION,
      userPoolId: import.meta.env.VITE_APP_USER_POOL_ID,
      userPoolWebClientId: import.meta.env.VITE_APP_USER_POOL_CLIENT_ID,
      identityPoolId: import.meta.env.VITE_APP_IDENTITY_POOL_ID,
      oauth: {
        domain: samlCognitoDomainName, // cdk.json の値を指定
        scope: ['openid', 'email', 'profile', 'aws.cognito.signin.user.admin'],
        // CloudFront で展開している Web ページを動的に取得
        redirectSignIn: window.location.origin,
        redirectSignOut: window.location.origin,
        responseType: 'code',
      },
    },
  });

  return (
    <>
      {loading ? (
        <Box
          display="grid"
          gridTemplateColumns="1fr"
          justifyItems="center"
          gap={4}>
          <Text marginTop={12} textAlign="center">
            Loading...
          </Text>
          <Spinner size="xl" />
        </Box>
      ) : !authenticated ? (
        <Box
          display="grid"
          gridTemplateColumns="1fr"
          justifyItems="center"
          gap={4}>
          <Text marginTop={12} textAlign="center" fontSize="3xl">
            JP RAG Sample
          </Text>
          <Button
            color="blue"
            onClick={() => signIn()}
            marginTop={6}
            width="60"
            fontSize="md">
            ログイン
          </Button>
        </Box>
      ) : (
        <App />
      )}
    </>
  );
};

export default AuthWithSAML;
