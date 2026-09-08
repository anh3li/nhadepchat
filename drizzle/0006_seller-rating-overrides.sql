CREATE TABLE `seller_metric_overrides` (
	`seller_id` text PRIMARY KEY NOT NULL,
	`rating` real DEFAULT 0 NOT NULL,
	`review_count` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`seller_id`) REFERENCES `seller_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `metric_settings` ADD `seller_rating_use_real` integer DEFAULT true NOT NULL;