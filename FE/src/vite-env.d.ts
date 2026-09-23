/// <reference types="vite/client" />

// ─── Khai báo type cho các biến môi trường tùy chỉnh ─────────────────────────
// Thêm biến mới vào đây để có TypeScript IntelliSense khi dùng import.meta.env

interface ImportMetaEnv {
  /** URL gốc của API backend */
  readonly VITE_API_URL: string
  /** Tên ứng dụng */
  readonly VITE_APP_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
