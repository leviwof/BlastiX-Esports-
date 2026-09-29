/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  /** Dev-only: set to "true" to enable the OTP-less sign-in bypass (dev server only). */
  readonly VITE_DEV_LOGIN?: string;
  /** Dev-only: email shown for the bypass admin session. */
  readonly VITE_DEV_ADMIN_EMAIL?: string;
  /** Dev-only: display name for the bypass admin session. */
  readonly VITE_DEV_ADMIN_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
