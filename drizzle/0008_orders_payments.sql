CREATE TABLE orders (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, total INTEGER NOT NULL, payment_status TEXT NOT NULL DEFAULT 'PENDING', payment_provider TEXT, provider_reference TEXT, paid_at INTEGER, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
CREATE INDEX idx_orders_user_status ON orders(user_id, payment_status);
CREATE UNIQUE INDEX orders_provider_reference_unique ON orders(provider_reference);
CREATE TABLE order_items (id TEXT PRIMARY KEY NOT NULL, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE, product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT, price INTEGER NOT NULL, created_at INTEGER NOT NULL);
CREATE INDEX idx_order_items_order_product ON order_items(order_id, product_id);
CREATE UNIQUE INDEX order_items_order_product_unique ON order_items(order_id, product_id);