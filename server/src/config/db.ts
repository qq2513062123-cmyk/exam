import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

import { env } from "./env";

const usesRemoteDatabase = !/(localhost|127\.0\.0\.1)/i.test(env.DATABASE_URL);

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: usesRemoteDatabase ? { rejectUnauthorized: false } : undefined
});

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function testDbConnection(): Promise<void> {
  await pool.query("SELECT 1");
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
