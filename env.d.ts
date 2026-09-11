declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    PUBLIC_ASSETS: R2Bucket;
    PRIVATE_FILES: R2Bucket;
    LEGACY_FILES?: R2Bucket;
    FILES?: R2Bucket;
    BETTER_AUTH_SECRET?: string;
    BETTER_AUTH_URL?: string;
    ADMIN_EMAILS?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    R2_ACCOUNT_ID?: string;
    R2_BUCKET_NAME?: string;
    R2_PUBLIC_BUCKET?: string;
    R2_PRIVATE_BUCKET?: string;
    NEXT_PUBLIC_MEDIA_URL?: string;
    R2_ACCESS_KEY_ID?: string;
    R2_SECRET_ACCESS_KEY?: string;
    PAYMENT_WEBHOOK_SECRET?: string;
  }
}
