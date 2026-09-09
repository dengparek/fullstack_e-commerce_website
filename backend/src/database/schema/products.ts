import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", { length: 200 }).notNull(),

    slug: varchar("slug", { length: 220 }).notNull().unique(),
    sku: varchar("sku", { length: 100 }).notNull().unique(),

    description: text("description"),

    // Note: Drizzle retrieves 'numeric' values as string to maintain precise decimals.
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),

    stock: integer("stock").notNull().default(0),

    imageUrl: text("image_url"),

    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Performance indexes for catalog queries and filters
    index("products_slug_idx").on(table.slug),
    index("products_is_active_idx").on(table.isActive),
  ],
);

// Type Inference Exports
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
