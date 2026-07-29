export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
export const CORS_ALLOW_LIST = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

export const FRESHNESS_BANDS = {
  FRESH: 30,
  RECENT: 120,
  DELAYED: 360,
} as const;