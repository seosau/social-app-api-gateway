import * as dotenv from 'dotenv';
import * as path from 'path';

// Load ngay từ file .env nằm ở root project
const result = dotenv.config({ path: path.resolve(__dirname, '../../.env') });


if (result.error) {
  console.error('⚠️ Could not load .env file:', result.error);
} else {
    console.log('✅ Loaded .env file successfully', result.parsed);
}

export const APP_CONFIG = {
  REDIS_URL: process.env.REDIS_URL,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: Number(process.env.REDIS_PORT),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_USERNAME: process.env.REDIS_USERNAME,
};