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
  if (!env.PRIVATE_FILES && !env.FILES) throw new Error('Cloudflare R2 binding `PRIVATE_FILES` chưa được cấu hình.');
  return env.PRIVATE_FILES || env.FILES!;
}

export function getPublicAssetsBucket() {
  if (!env.PUBLIC_ASSETS && !env.FILES) throw new Error('Cloudflare R2 binding `PUBLIC_ASSETS` chưa được cấu hình.');
  return env.PUBLIC_ASSETS || env.FILES!;
}

export function getLegacyFilesBucket() {
  if (!env.LEGACY_FILES && !env.FILES) throw new Error('Cloudflare R2 binding legacy chưa được cấu hình.');
  return env.LEGACY_FILES || env.FILES!;
}
