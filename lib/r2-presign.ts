import { env } from 'cloudflare:workers';
import { AwsClient } from 'aws4fetch';

export async function presignPrivateGet(objectKey: string, expiresIn = 600) {
  const bucket = env.R2_PRIVATE_BUCKET || env.R2_BUCKET_NAME;
  if (!env.R2_ACCOUNT_ID || !bucket || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) return null;
  const encodedKey = objectKey.split('/').map(encodeURIComponent).join('/');
  const target = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${bucket}/${encodedKey}?X-Amz-Expires=${expiresIn}`;
  const aws = new AwsClient({ accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY, service: 's3', region: 'auto' });
  return (await aws.sign(target, { method: 'GET', aws: { signQuery: true } })).url;
}