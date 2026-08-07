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
  SUPABASE_URL: z.string().min(1),               // add
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  // Optional integrations — the app runs fine without these; status endpoints
  // report them as unconfigured and the features fail closed.
  TWILIO_ACCOUNT_SID: z.string().optional().default(''),
  TWILIO_AUTH_TOKEN: z.string().optional().default(''),
  TWILIO_FROM_NUMBER: z.string().optional().default(''),
  VAPI_API_KEY: z.string().optional().default(''),
  INCOIS_FEED_URL: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
