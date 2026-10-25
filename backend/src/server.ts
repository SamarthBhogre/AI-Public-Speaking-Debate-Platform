import { createApp } from './app';
import { env } from './config/env';
import { pool } from './database/pool';
import { runMigrations } from './database/migrate';

async function main() {
  await runMigrations();

  const app = createApp();
  const server = app.listen(parseInt(env.PORT), () => {
    console.log(`✅ SpeakWell API running on port ${env.PORT}`);
  });

  const shutdown = async () => {
    console.log('Shutting down gracefully...');
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
