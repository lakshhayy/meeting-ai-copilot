import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log("Enabling pgvector extension...");
  await pool.query("CREATE EXTENSION IF NOT EXISTS vector;");
  console.log("Extension enabled successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to enable extension:", err);
  process.exit(1);
});
