import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'require' ? { rejectUnauthorized: false } : undefined,
});

(async () => {
  try {
    const { rows } = await pool.query('SELECT NOW() AS now');
    console.log('Hora del servidor PostgreSQL:', rows[0].now);
  } catch (err) {
    console.error('Error de conexión/consulta:', err.message);
  } finally {
    await pool.end();
  }
})();