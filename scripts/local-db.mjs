import { mkdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = process.cwd();
const tempDir = resolve(root, '.wrangler');
const configPath = resolve(tempDir, 'local-d1-config.jsonc');
const wrangler = resolve(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const config = {
  name: 'nha-dep-chat-local-db',
  compatibility_date: '2026-09-04',
  d1_databases: [{
    binding: 'DB', database_name: 'site-creator-d1',
    database_id: '00000000-0000-4000-8000-000000000000', migrations_dir: '../drizzle',
  }],
  r2_buckets: [{ binding: 'FILES', bucket_name: 'site-creator-r2' }],
};

function run(args) {
  const result = spawnSync(process.execPath, [wrangler, ...args, '--config', configPath], { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) process.exitCode = result.status || 1;
}

await mkdir(tempDir, { recursive: true });
await writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
try {
  // Older local databases predate Wrangler's migration ledger. Mark only the
  // migrations whose tables are already present, then let Wrangler apply the rest.
  run(['d1', 'execute', 'site-creator-d1', '--local', '--persist-to', '.wrangler/state', '--command', `
    CREATE TABLE IF NOT EXISTS d1_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, applied_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL);
    INSERT OR IGNORE INTO d1_migrations (name) SELECT '0000_funny_skullbuster.sql' WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='account');
    INSERT OR IGNORE INTO d1_migrations (name) SELECT '0001_groovy_wildside.sql' WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='favorites');
  `]);
  if (process.exitCode) process.exit(process.exitCode);
  run(['d1', 'migrations', 'apply', 'site-creator-d1', '--local', '--persist-to', '.wrangler/state']);
  if (process.exitCode) process.exit(process.exitCode);
  if (process.argv.includes('--seed')) run(['d1', 'execute', 'site-creator-d1', '--local', '--persist-to', '.wrangler/state', '--file', 'db/seed.sql']);
} finally {
  await rm(configPath, { force: true });
}
