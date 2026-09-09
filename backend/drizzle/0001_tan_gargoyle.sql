ALTER TABLE "products" ADD COLUMN "sku" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_sku_unique" UNIQUE("sku");