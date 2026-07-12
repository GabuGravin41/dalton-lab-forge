import pg from 'pg';
const { Pool } = pg;

let pool: any = null;

export function getDbPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is missing. Please set it in Vercel settings.");
    }
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false // Required for Neon Postgres
      }
    });
  }
  return pool;
}
