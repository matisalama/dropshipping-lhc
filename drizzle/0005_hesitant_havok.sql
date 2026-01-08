CREATE TABLE `productMedia` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`type` enum('photo','video','link') NOT NULL,
	`url` text NOT NULL,
	`title` varchar(255),
	`description` text,
	`displayOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productMedia_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shippingCosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`city` varchar(255) NOT NULL,
	`standardCost` int NOT NULL,
	`sameDayCost` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shippingCosts_id` PRIMARY KEY(`id`),
	CONSTRAINT `shippingCosts_city_unique` UNIQUE(`city`)
);
--> statement-breakpoint
ALTER TABLE `productMedia` ADD CONSTRAINT `productMedia_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;