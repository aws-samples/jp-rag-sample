import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'aws': ['@aws-sdk/client-kendra'],
          'chakra-ui': ['@chakra-ui/icons'],
          '@chakra-ui/react': ['@chakra-ui/react']
        },
      },
    },
  },
  base: "./",
  resolve: {
    alias: [
    {
      find: './runtimeConfig',
      replacement: './runtimeConfig.browser', // ensures browser compatible version of AWS JS SDK is used
    },
  ]
}
})
