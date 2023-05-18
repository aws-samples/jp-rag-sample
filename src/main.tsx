import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ChakraProvider } from '@chakra-ui/react'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <div>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </div>,
)