import dotenv from 'dotenv';
dotenv.config();
export const config = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mt5ServiceUrl: process.env.MT5_SERVICE_URL ?? 'http://127.0.0.1:8000',
  disableAuth: process.env.DISABLE_AUTH === 'true',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  firebaseServiceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
};
// ...existing code...
if (config.firebaseServiceAccountJson) {
  try {
    JSON.parse(config.firebaseServiceAccountJson);
    console.log('[server] FIREBASE_SERVICE_ACCOUNT_JSON provided and valid JSON');
  } catch (err) {
    console.error('[server] FIREBASE_SERVICE_ACCOUNT_JSON is invalid JSON:', err);
  }
} else {
  console.log('[server] FIREBASE_SERVICE_ACCOUNT_JSON not provided');
}