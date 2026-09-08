ALTER TABLE `metric_settings` ADD `rating_use_real` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `product_metric_overrides` ADD `rating` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `product_metric_overrides` ADD `review_count` integer DEFAULT 0 NOT NULL;