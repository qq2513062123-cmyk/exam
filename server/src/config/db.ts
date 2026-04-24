import fs from "fs";
import path from "path";

import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

import { env } from "./env";

function resolveSslConfig() {
  try {
    const url = new URL(env.DATABASE_URL);
    const hostname = url.hostname.toLowerCase();

    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".railway.internal")
    ) {
      return undefined;
    }

    if (hostname.includes("supabase.co") || hostname.includes("supabase.com")) {
      return { rejectUnauthorized: false };
    }

    return { rejectUnauthorized: false };
  } catch {
    return undefined;
  }
}

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: resolveSslConfig(),
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000
});

let setupPromise: Promise<void> | null = null;

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return ensureDatabaseSetup().then(() => pool.query<T>(text, params));
}

export async function testDbConnection(): Promise<void> {
  await pool.query("SELECT 1");
}

async function runDatabaseSetup(): Promise<void> {
  const tableCheck = await pool.query<{ exists: string | null }>(
    "SELECT to_regclass('public.profiles') AS exists"
  );

  const profilesExists = tableCheck.rows[0]?.exists !== null;

  if (!profilesExists) {
    const migrationSql = fs.readFileSync(
      path.resolve(process.cwd(), "src/db/migrations/001_init_schema.sql"),
      "utf8"
    );

    await pool.query(migrationSql);
  }

  const seedSql = fs.readFileSync(
    path.resolve(process.cwd(), "src/db/seeds/001_seed_profiles.sql"),
    "utf8"
  );

  await pool.query(seedSql);
}

export async function ensureDatabaseSetup(): Promise<void> {
  if (!setupPromise) {
    setupPromise = runDatabaseSetup().catch((error) => {
      setupPromise = null;
      throw error;
    });
  }

  await setupPromise;
}

export async function withTransaction<T>(
  handler: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await handler(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
