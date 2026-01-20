import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase requires this
});

export async function connectDb(){
  try {
    await pool.query("SELECT 1");
    console.log("Postgres connection complete.");
  } catch (error) {
    console.log("Failed to start the server" , error.message)
    process.exit(1);
  }
}

export default pool;
