import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { DATABASE_URL, NODE_ENV } from "../config/env";
import * as schema from "./schema";

export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20, // Maximum pool connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
});

export const db = drizzle(pool, { schema });

export const connectDB = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log(" PostgreSQL connected successfully");
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown for process signals
const closePool = async () => {
  console.log("Closing database connection pool...");
  await pool.end();
  process.exit(0);
};

process.on("SIGINT", closePool);
process.on("SIGTERM", closePool);
