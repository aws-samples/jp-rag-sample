import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [
      react(),
      svgr(),
      nodePolyfills({
        globals: {
          Buffer: true,
          process: true,
        },
      }),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true,
        },
        injectRegister: 'auto',
        manifest: {
          name: 'JP RAG Sample',
          short_name: 'JP RAG Sample',
          description:
            'Retrieval Augmented Generation (RAG) のアプリケーション実装',
          start_url: '/',
          display: 'minimal-ui',
          theme_color: '#232F3E',
          background_color: '#FFFFFF',
          icons: [
            {
              src: '/images/aws_icon_192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/images/aws_icon_192_maskable.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/images/aws_icon_512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/images/aws_icon_512_maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            aws: ['@aws-sdk/client-kendra'],
            'chakra-ui': ['@chakra-ui/icons'],
            '@chakra-ui/react': ['@chakra-ui/react'],
          },
        },
      },
    },
    esbuild: {
      drop: command === 'build' ? ['console', 'debugger'] : [],
    },
    base: './',
    resolve: {
      alias: [
        {
          find: './runtimeConfig',
          replacement: './runtimeConfig.browser', // ensures browser compatible version of AWS JS SDK is used
        },
      ],
    },
  };
});
