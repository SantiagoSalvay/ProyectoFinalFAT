/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LOCATIONIQ_API_KEY: string;
  // otras variables de entorno personalizadas aquí
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
