import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "./src/config/env";

export default defineConfig({
  schema: "./src/database/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
  casing: "snake_case",
  strict: true,
  verbose: true,
});
