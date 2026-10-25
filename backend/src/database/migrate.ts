import fs from 'fs';
import path from 'path';
import { pool } from './pool';

export async function runMigrations() {
  const candidates = [
    path.join(__dirname, 'migrations'),
    path.resolve(process.cwd(), 'src/database/migrations'),
    path.resolve(process.cwd(), 'backend/src/database/migrations'),
  ];
  const migrationsDir = candidates.find(candidate => fs.existsSync(candidate));
  if (!migrationsDir) throw new Error('Database migrations directory was not found');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      filename VARCHAR(255) PRIMARY KEY,
      ran_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  for (const file of files) {
    const { rows } = await pool.query('SELECT 1 FROM _migrations WHERE filename = $1', [file]);
    if (rows.length > 0) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await pool.query(sql);
    await pool.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
    console.log(`✅ Migration ran: ${file}`);
  }
}
