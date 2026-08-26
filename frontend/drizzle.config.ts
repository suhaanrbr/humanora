import { defineConfig } from "drizzle-kit";

// Only used by the `drizzle-kit` CLI (push/generate/studio), never by the
// running app — so it's fine for this to require DATABASE_URL eagerly.
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
