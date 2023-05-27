/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ACCESS_KEY_ID: string
    readonly VITE_SECRET_ACCESS_KEY: string
    readonly VITE_REGION: string
    readonly VITE_INDEX_ID: string
    readonly VITE_SERVER_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}