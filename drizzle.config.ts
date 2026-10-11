import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Next.js reads `.env.local`; drizzle-kit does not unless we load it here.
config({ path: ".env.local" });
config({ path: ".env" });

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL is missing. Copy .env.example to .env.local and paste your Neon connection string.",
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
});
