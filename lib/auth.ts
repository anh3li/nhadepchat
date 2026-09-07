import { env } from 'cloudflare:workers';
import { betterAuth } from 'better-auth';
import { googleAuthEnabled } from './google-auth';

const productionOrigin = env.BETTER_AUTH_URL || 'http://localhost:3000';

export const auth = betterAuth({
  database: env.DB,
  secret: env.BETTER_AUTH_SECRET || (process.env.NODE_ENV === 'production' ? undefined : 'local-development-secret-change-me-32chars'),
  baseURL: productionOrigin,
  trustedOrigins: [productionOrigin, 'http://localhost:3000'],
  emailAndPassword: { enabled: true, minPasswordLength: 12, maxPasswordLength: 128 },
  socialProviders: googleAuthEnabled() ? {
    google: {
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
      prompt: 'select_account',
    },
  } : {},
  account: {
    accountLinking: {
      enabled: true,
      requireLocalEmailVerified: true,
      allowDifferentEmails: false,
    },
  },
  user: {
    additionalFields: {
      role: { type: ['user', 'seller', 'admin'], required: false, defaultValue: 'user', input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const now = Date.now();
          const base = slugify(user.name || user.email.split('@')[0]);
          const slug = `${base}-${user.id.slice(0, 6)}`;
          const isAdmin = (env.ADMIN_EMAILS || '').split(',').map((x) => x.trim().toLowerCase()).includes(user.email.toLowerCase());
          const role = isAdmin ? 'admin' : 'user';
          await env.DB.prepare('INSERT OR IGNORE INTO user_profiles (id,user_id,slug,display_name,bio,role,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)')
            .bind(crypto.randomUUID(), user.id, slug, user.name, '', role, now, now).run();
          if (isAdmin) await env.DB.prepare("UPDATE user SET role='admin',updatedAt=? WHERE id=?").bind(now, user.id).run();
        },
      },
      update: {
        after: async (user) => {
          await env.DB.prepare('UPDATE user_profiles SET display_name=?,updated_at=? WHERE user_id=?')
            .bind(user.name, Date.now(), user.id).run();
        },
      },
    },
  },
  advanced: { database: { generateId: 'uuid' } },
});

function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'thanh-vien';
}
