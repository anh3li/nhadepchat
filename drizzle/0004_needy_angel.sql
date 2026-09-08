CREATE TABLE `metric_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`home_use_real` integer DEFAULT true NOT NULL,
	`home_product_count` integer DEFAULT 0 NOT NULL,
	`home_free_count` integer DEFAULT 0 NOT NULL,
	`home_seller_count` integer DEFAULT 0 NOT NULL,
	`home_download_count` integer DEFAULT 0 NOT NULL,
	`product_use_real` integer DEFAULT true NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `product_metric_overrides` (
	`product_id` text PRIMARY KEY NOT NULL,
	`view_count` integer DEFAULT 0 NOT NULL,
	`download_count` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
