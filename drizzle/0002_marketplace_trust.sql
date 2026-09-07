CREATE TABLE `product_views` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`viewer_key` text NOT NULL,
	`viewed_on` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_views_daily_unique` ON `product_views` (`product_id`,`viewer_key`,`viewed_on`);
--> statement-breakpoint
CREATE INDEX `idx_product_views_product_created` ON `product_views` (`product_id`,`created_at`);
--> statement-breakpoint
CREATE TABLE `product_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`user_id` text NOT NULL,
	`rating` integer NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
	`comment` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_reviews_user_unique` ON `product_reviews` (`product_id`,`user_id`);
--> statement-breakpoint
CREATE INDEX `idx_product_reviews_product_updated` ON `product_reviews` (`product_id`,`updated_at`);
--> statement-breakpoint
CREATE TABLE `seller_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`seller_id` text NOT NULL,
	`user_id` text NOT NULL,
	`rating` integer NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
	`comment` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`seller_id`) REFERENCES `seller_profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `seller_reviews_user_unique` ON `seller_reviews` (`seller_id`,`user_id`);
--> statement-breakpoint
CREATE INDEX `idx_seller_reviews_seller_updated` ON `seller_reviews` (`seller_id`,`updated_at`);
