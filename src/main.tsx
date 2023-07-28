// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// import './index.css'
import { ChakraProvider } from '@chakra-ui/react'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <div>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </div>,
)