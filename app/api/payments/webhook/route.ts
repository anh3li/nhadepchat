import { env } from 'cloudflare:workers';
import { getD1 } from '../../../../db';

async function validSignature(raw: string, signature: string) {
  if (!env.PAYMENT_WEBHOOK_SECRET || !signature) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.PAYMENT_WEBHOOK_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw));
  const expected = [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
  return expected === signature.toLowerCase();
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!await validSignature(raw, request.headers.get('x-payment-signature') || '')) return Response.json({ error: 'Invalid signature.' }, { status: 401 });
  const body = JSON.parse(raw) as { orderId?: string; status?: string; providerReference?: string };
  if (!body.orderId || !body.status) return Response.json({ error: 'Invalid webhook.' }, { status: 422 });
  const paid = ['PAID', 'SUCCESS'].includes(body.status.toUpperCase()), now = Date.now(), db = getD1();
  await db.prepare('UPDATE orders SET payment_status=?,paid_at=?,provider_reference=?,updated_at=? WHERE id=?').bind(paid ? 'PAID' : 'FAILED', paid ? now : null, body.providerReference || null, now, body.orderId).run();
  return Response.json({ ok: true });
}
