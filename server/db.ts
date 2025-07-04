import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use external Render database URL
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://ai_job_chommie_db_user:HherCWoGklyRl47PkFGHdygiGmfdUySG@dpg-d1ibccali9vc73foshgg-a.oregon-postgres.render.com/ai_job_chommie_db';

export const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const db = drizzle(pool, { schema });