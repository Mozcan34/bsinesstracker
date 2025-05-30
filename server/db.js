import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';
// Supabase PostgreSQL bağlantısı
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
}
// PostgreSQL bağlantısı
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
export * from '@shared/schema';
