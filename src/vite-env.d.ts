/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_REGION: string
    readonly VITE_INDEX_ID: string
    readonly VITE_SERVER_URL: string
    readonly VITE_USER_POOL_ID: string
    readonly VITE_USER_POOL_CLIENT_ID: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}