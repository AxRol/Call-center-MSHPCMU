import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

// --- Connexion locale (développement) ---
// const connectionConfig = {
//   host:     process.env.DB_HOST     || 'localhost',
//   user:     process.env.DB_USER     || 'postgres',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME     || 'centre_appels',
//   port:     Number(process.env.DB_PORT) || 5432,
//   ssl:      false,
// }; 

// --- Connexion Neon (production) — décommenter pour le déploiement ---
const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host:     process.env.DB_HOST,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port:     Number(process.env.DB_PORT) || 5432,
      ssl:      { rejectUnauthorized: false },
    };


const pool = new pg.Pool({
  ...connectionConfig,
  max:                     10,
  idleTimeoutMillis:       30000,
  connectionTimeoutMillis: 5000,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erreur connexion BD:', err.message);
  }
  release();
  console.log('Connecté à la base de données PostgreSQL (locale)');
});

export default pool;
