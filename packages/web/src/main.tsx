// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import ReactDOM from 'react-dom/client';
// import './index.css'
import { ChakraProvider } from '@chakra-ui/react';
import { Authenticator } from '@aws-amplify/ui-react';
import AuthWithSAML from './components/AuthWithSAML.tsx';
import AuthWithUserpool from './components/AuthWithUserpool.tsx';

const samlAuthEnabled: boolean =
  import.meta.env.VITE_APP_SAMLAUTH_ENABLED === 'true';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <div>
    <ChakraProvider>
      <Authenticator.Provider>
        {samlAuthEnabled ? <AuthWithSAML /> : <AuthWithUserpool />}
      </Authenticator.Provider>
    </ChakraProvider>
  </div>
);
