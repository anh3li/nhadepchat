# NHÀ ĐẸP CHẤT

Marketplace hồ sơ xây dựng chạy trên Vinext/Next.js 16, Better Auth, Cloudflare Workers, D1 và private R2. Phase hiện tại hỗ trợ đăng ký/đăng nhập, onboarding KTS/người bán, đăng và duyệt sản phẩm, hồ sơ KTS, tìm kiếm, yêu thích, upload riêng tư và tải hồ sơ miễn phí. Thanh toán chưa được bật.

Repository: <https://github.com/anh3li/nhadepchat>

## Chạy local

Yêu cầu Node.js 22.13+.

1. Chạy `npm install`.
2. Sao chép `.dev.vars.example` thành `.dev.vars`, đặt `BETTER_AUTH_SECRET` ngẫu nhiên dài ít nhất 32 ký tự. Không commit `.dev.vars`.
3. Chạy `npm run db:setup` để tạo D1 local và apply migrations trong `drizzle/`.
4. Tùy chọn: `npm run db:seed` chỉ dành cho dữ liệu development.
5. Chạy `npm run dev`, mở `http://localhost:3000`.

## Cloudflare resources

Worker production là `nhadepchat`. Cấu hình nguồn nằm trong `wrangler.jsonc`.

- D1 binding `DB` → database `nhadepchat-db`.
- R2 binding `FILES` → private bucket `nhadepchat-files`.
- Compatibility flag bắt buộc: `nodejs_compat`.

Schema D1 nằm ở `db/schema.ts`. Migrations phải được giữ nguyên thứ tự trong `drizzle/` và không seed dữ liệu demo vào production:

```text
npx wrangler d1 migrations apply nhadepchat-db --remote --config wrangler.jsonc
```

Bucket `nhadepchat-files` không bật public access. Ảnh và file gốc được đọc qua API có kiểm tra session, trạng thái và quyền. Khi chưa cấu hình bốn biến `R2_*`, ứng dụng dùng authenticated server-stream upload qua binding `FILES`. Direct browser upload chỉ nên dùng S3 token Object Read & Write giới hạn đúng bucket và CORS giới hạn production origin/localhost.

## Worker secrets

Không ghi giá trị thật vào GitHub, README, `wrangler.jsonc` hoặc source. Cấu hình bằng `npx wrangler secret put <NAME>`:

- `BETTER_AUTH_SECRET`: bắt buộc, tối thiểu 32 ký tự ngẫu nhiên.
- `BETTER_AUTH_URL`: URL production chính xác (`https://...workers.dev` hoặc custom domain).
- `ADMIN_EMAILS`: danh sách email admin bootstrap, phân tách bằng dấu phẩy.
- `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`: tùy chọn, chỉ cho direct upload.

Để bootstrap admin đầu tiên, đặt `ADMIN_EMAILS`, deploy rồi đăng ký đúng email đó. Không hardcode email admin trong source.

## Kiểm tra và deploy

```text
npm run lint
npx tsc --noEmit
npm run build
npm run deploy
```

`npm run deploy` dùng adapter `@vinext/cloudflare` và Wrangler, không dùng OpenAI Sites. Sau deploy phải kiểm tra trực tiếp URL production: homepage/assets, auth/session, onboarding seller, draft/submit/admin approve, public detail/profile, favorite/gallery và tải file miễn phí.

## GitHub auto-deploy

Workflow `.github/workflows/deploy.yml` kiểm tra lint/type/build, apply D1 migrations và deploy `main`. Repository cần hai GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN`: token tối thiểu có Workers Scripts Write, D1 Edit và quyền cần thiết cho bindings.
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID.

Các Worker secrets ứng dụng vẫn được quản lý bằng Cloudflare Worker Secrets, không đưa vào GitHub Actions.

## Scripts

- `npm run dev` — local development
- `npm run lint` — ESLint
- `npm run build` — production build
- `npm run deploy` — build và deploy Cloudflare Worker native
- `npm run db:generate` — sinh migration từ Drizzle schema
- `npm run db:setup` — apply migrations vào D1 local
- `npm run db:seed` — nạp dữ liệu development local

## Giới hạn Phase hiện tại

Payment gateway, checkout, ví/số dư seller, commission, withdrawal, chat, job marketplace, follow, rating/review và realtime notification chưa được triển khai. Trang quên mật khẩu chỉ hoàn thiện khi có email provider.
