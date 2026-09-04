import { index, integer, primaryKey, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const timestamps = {
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp_ms' }).notNull(),
};

export const users = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  role: text('role', { enum: ['user', 'seller', 'admin'] }).notNull().default('user'),
  ...timestamps,
}, (table) => [uniqueIndex('user_email_unique').on(table.email)]);

export const sessions = sqliteTable('session', {
  id: text('id').primaryKey(), userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull(), expiresAt: integer('expiresAt', { mode: 'timestamp_ms' }).notNull(),
  ipAddress: text('ipAddress'), userAgent: text('userAgent'), ...timestamps,
}, (table) => [uniqueIndex('session_token_unique').on(table.token), index('idx_session_user_id').on(table.userId)]);

export const accounts = sqliteTable('account', {
  id: text('id').primaryKey(), userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  issuer: text('issuer').notNull(), accountId: text('accountId').notNull(), providerId: text('providerId').notNull(),
  accessToken: text('accessToken'), refreshToken: text('refreshToken'), accessTokenExpiresAt: integer('accessTokenExpiresAt', { mode: 'timestamp_ms' }),
  refreshTokenExpiresAt: integer('refreshTokenExpiresAt', { mode: 'timestamp_ms' }), scope: text('scope'), idToken: text('idToken'), password: text('password'), ...timestamps,
}, (table) => [uniqueIndex('account_issuer_account_id_unique').on(table.issuer, table.accountId), index('idx_account_user_id').on(table.userId)]);

export const verifications = sqliteTable('verification', {
  id: text('id').primaryKey(), identifier: text('identifier').notNull(), value: text('value').notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp_ms' }).notNull(), ...timestamps,
}, (table) => [index('idx_verification_identifier').on(table.identifier)]);

export const userProfiles = sqliteTable('user_profiles', {
  id: text('id').primaryKey(), userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull(), displayName: text('display_name').notNull(), avatarKey: text('avatar_key'), bio: text('bio').notNull().default(''),
  phone: text('phone'), zalo: text('zalo'), location: text('location'), role: text('role', { enum: ['user', 'seller', 'admin'] }).notNull().default('user'),
  createdAt: integer('created_at').notNull(), updatedAt: integer('updated_at').notNull(),
}, (table) => [uniqueIndex('user_profiles_user_unique').on(table.userId), uniqueIndex('user_profiles_slug_unique').on(table.slug), index('idx_user_profiles_role').on(table.role)]);

export const sellerProfiles = sqliteTable('seller_profiles', {
  id: text('id').primaryKey(), userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sellerType: text('seller_type', { enum: ['architect','engineer','interior_designer','contractor','student','other'] }).notNull(),
  professionalTitle: text('professional_title').notNull(), experienceYears: integer('experience_years'), company: text('company'), location: text('location'), website: text('website'),
  verificationStatus: text('verification_status', { enum: ['unverified','pending','verified','rejected'] }).notNull().default('unverified'), verifiedAt: integer('verified_at'),
  createdAt: integer('created_at').notNull(), updatedAt: integer('updated_at').notNull(),
}, (table) => [uniqueIndex('seller_profiles_user_unique').on(table.userId), index('idx_seller_profiles_verification').on(table.verificationStatus)]);

export const products = sqliteTable('products', {
  id: text('id').primaryKey(), sellerId: text('seller_id').notNull().references(() => sellerProfiles.id, { onDelete: 'cascade' }), slug: text('slug').notNull(),
  title: text('title').notNull(), shortDescription: text('short_description').notNull(), description: text('description').notNull(), category: text('category').notNull(), buildingType: text('building_type').notNull(), style: text('style').notNull().default('Khác'),
  width: real('width'), length: real('length'), floors: integer('floors'), area: real('area'), price: integer('price').notNull().default(0), isFree: integer('is_free', { mode: 'boolean' }).notNull().default(false),
  status: text('status', { enum: ['draft','pending','approved','rejected','archived'] }).notNull().default('draft'), rejectionReason: text('rejection_reason'),
  createdAt: integer('created_at').notNull(), submittedAt: integer('submitted_at'), approvedAt: integer('approved_at'), updatedAt: integer('updated_at').notNull(),
}, (table) => [uniqueIndex('products_slug_unique').on(table.slug), index('idx_products_title').on(table.title), index('idx_products_status_approved_at').on(table.status, table.approvedAt), index('idx_products_seller_status').on(table.sellerId, table.status), index('idx_products_category').on(table.category), index('idx_products_building_type').on(table.buildingType), index('idx_products_created_at').on(table.createdAt)]);

export const productAssets = sqliteTable('product_assets', {
  id: text('id').primaryKey(), productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }), objectKey: text('object_key').notNull(),
  type: text('type', { enum: ['preview','cover'] }).notNull().default('preview'), sortOrder: integer('sort_order').notNull().default(0), width: integer('width'), height: integer('height'), createdAt: integer('created_at').notNull(),
}, (table) => [uniqueIndex('product_assets_object_key_unique').on(table.objectKey), index('idx_product_assets_product_sort').on(table.productId, table.sortOrder)]);

export const productFiles = sqliteTable('product_files', {
  id: text('id').primaryKey(), productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }), objectKey: text('object_key').notNull(), originalName: text('original_name').notNull(),
  extension: text('extension').notNull(), mimeType: text('mime_type').notNull(), size: integer('size').notNull(), createdAt: integer('created_at').notNull(),
}, (table) => [uniqueIndex('product_files_object_key_unique').on(table.objectKey), index('idx_product_files_product_id').on(table.productId)]);

export const productFormats = sqliteTable('product_formats', {
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }), format: text('format').notNull(),
}, (table) => [primaryKey({ columns: [table.productId, table.format] }), index('idx_product_formats_format').on(table.format)]);

export const productDisciplines = sqliteTable('product_disciplines', {
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }), discipline: text('discipline').notNull(),
}, (table) => [primaryKey({ columns: [table.productId, table.discipline] })]);

export const productTools = sqliteTable('product_tools', {
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }), tool: text('tool').notNull(),
}, (table) => [primaryKey({ columns: [table.productId, table.tool] }), index('idx_product_tools_tool').on(table.tool)]);

export const productKeywords = sqliteTable('product_keywords', {
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }), keyword: text('keyword').notNull(),
}, (table) => [primaryKey({ columns: [table.productId, table.keyword] }), index('idx_product_keywords_keyword').on(table.keyword)]);

export const downloads = sqliteTable('downloads', {
  id: text('id').primaryKey(), userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }), createdAt: integer('created_at').notNull(),
}, (table) => [index('idx_downloads_product_created').on(table.productId, table.createdAt), index('idx_downloads_user_created').on(table.userId, table.createdAt)]);

export const favorites = sqliteTable('favorites', {
  id: text('id').primaryKey(), userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }), createdAt: integer('created_at').notNull(),
}, (table) => [uniqueIndex('favorites_user_product_unique').on(table.userId, table.productId), index('idx_favorites_user_created').on(table.userId, table.createdAt), index('idx_favorites_product_id').on(table.productId)]);
