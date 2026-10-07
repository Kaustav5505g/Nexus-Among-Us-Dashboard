/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.jsx' {
  const component: React.ComponentType<any>;
  export default component;
}

declare module './games/Wordle' {
  const component: React.ComponentType<any>;
  export default component;
}

declare module './games/Emoji/Emoji' {
  const component: React.ComponentType<any>;
  export default component;
}
