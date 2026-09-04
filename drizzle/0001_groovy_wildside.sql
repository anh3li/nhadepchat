CREATE TABLE `favorites` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`product_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `favorites_user_product_unique` ON `favorites` (`user_id`,`product_id`);--> statement-breakpoint
CREATE INDEX `idx_favorites_user_created` ON `favorites` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_favorites_product_id` ON `favorites` (`product_id`);--> statement-breakpoint
CREATE TABLE `product_keywords` (
	`product_id` text NOT NULL,
	`keyword` text NOT NULL,
	PRIMARY KEY(`product_id`, `keyword`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_product_keywords_keyword` ON `product_keywords` (`keyword`);--> statement-breakpoint
CREATE TABLE `product_tools` (
	`product_id` text NOT NULL,
	`tool` text NOT NULL,
	PRIMARY KEY(`product_id`, `tool`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_product_tools_tool` ON `product_tools` (`tool`);--> statement-breakpoint
ALTER TABLE `products` ADD `style` text DEFAULT 'Khác' NOT NULL;