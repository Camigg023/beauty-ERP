import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;
const secret = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required for authentication');
}

if (!secret) {
  throw new Error('BETTER_AUTH_SECRET or AUTH_SECRET is required for authentication');
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 5,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
});

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  database: pool,
  secret,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  ...(googleClientId && googleClientSecret
    ? {
        socialProviders: {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        },
      }
    : {}),
});