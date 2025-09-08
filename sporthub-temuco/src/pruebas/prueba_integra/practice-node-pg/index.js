import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const client = new Client({
connectionString: process.env.DATABASE_URL,
ssl: process.env.PGSSL === 'require' ? { rejectUnauthorized: false } : undefined,
});

const { rows } = await pool.query(
  'SELECT id, email FROM usuarios WHERE id = $1',
  [1]
);
console.log(rows[0]);

(async () => {
try {
await client.connect();
const { rows } = await client.query('SELECT NOW() AS now');
console.log('La hora en el servidor PostgreSQL es:', rows[0].now);
} catch (err) {
console.error('Error de conexión/consulta:', err.message);
} finally {
await client.end();
}
})();