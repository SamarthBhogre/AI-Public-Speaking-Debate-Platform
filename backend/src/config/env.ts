import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 chars'),
  OPENROUTER_API_KEY: z.string().optional().default(''),
  OPENROUTER_SITE_URL: z.string().optional().default(''),
  OPENROUTER_APP_NAME: z.string().optional().default('SpeakWell'),
  AI_MODEL: z.string().optional().default(''),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  NODE_ENV: z.string().default('development'),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;
try {
  env = envSchema.parse(process.env);
} catch (err) {
  console.error('❌ Invalid environment variables:', (err as any).errors);
  process.exit(1);
}
export { env };
