import { Amplify, I18n } from 'aws-amplify';
import { Authenticator, translations } from '@aws-amplify/ui-react';
import App from '../App.tsx';

const selfSignUpEnabled: boolean =
  import.meta.env.VITE_APP_SELF_SIGN_UP_ENABLED === 'true';

const AuthWithUserpool: React.FC = () => {
  Amplify.configure({
    Auth: {
      userPoolId: import.meta.env.VITE_APP_USER_POOL_ID,
      userPoolWebClientId: import.meta.env.VITE_APP_USER_POOL_CLIENT_ID,
      identityPoolId: import.meta.env.VITE_APP_IDENTITY_POOL_ID,
      authenticationFlowType: 'USER_SRP_AUTH',
    },
  });

  I18n.putVocabularies(translations);
  I18n.setLanguage('ja');

  return (
    <Authenticator hideSignUp={!selfSignUpEnabled}>
      <App />
    </Authenticator>
  );
};

export default AuthWithUserpool;
