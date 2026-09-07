import { env } from 'cloudflare:workers';

// Server-only: never pass credentials to a client component.
export function googleAuthEnabled() {
  return Boolean(env.GOOGLE_CLIENT_ID?.trim() && env.GOOGLE_CLIENT_SECRET?.trim());
}
