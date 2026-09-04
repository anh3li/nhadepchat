import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function getDb() {
  if (!env.DB) throw new Error('Cloudflare D1 binding `DB` chưa được cấu hình.');
  return drizzle(env.DB, { schema });
}

export function getD1() {
  if (!env.DB) throw new Error('Cloudflare D1 binding `DB` chưa được cấu hình.');
  return env.DB;
}

export function getFilesBucket() {
  if (!env.FILES) throw new Error('Cloudflare R2 binding `FILES` chưa được cấu hình.');
  return env.FILES;
}
