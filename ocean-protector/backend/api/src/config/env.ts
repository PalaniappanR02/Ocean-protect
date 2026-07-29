import dotenv from 'dotenv';
import z from 'zod';

dotenv.config();

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return false;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}, z.boolean());

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.string().default('development'),
  DATABASE_URL: z.string().min(1),
  CLASSIFIER_SERVICE_URL: z.string().min(1).default('http://localhost:8000'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  ALLOW_RENDER_ORIGINS: booleanFromEnv.default(false),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
