DROP INDEX "cart_items_cart_id_idx";--> statement-breakpoint
DROP INDEX "carts_user_id_idx";--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;