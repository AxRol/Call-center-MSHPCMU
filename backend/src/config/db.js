import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // En production (Neon, Supabase...) le SSL est obligatoire
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test de connexion (Version PostgreSQL)
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Erreur connexion BD:', err.stack);
  }
  release(); // Libère le client immédiatement
  console.log('✅ Connecté à la base de données PostgreSQL');
});

export default pool;