import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { products } from "./products";
import { users } from "./users";

// --- CARTS TABLE ---
export const carts = pgTable(
  "carts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("carts_user_id_idx").on(table.userId)],
);

// --- CART ITEMS TABLE ---
export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    quantity: integer("quantity").notNull().default(1),
  },
  (table) => [
    unique("cart_product_unique").on(table.cartId, table.productId),
    index("cart_items_cart_id_idx").on(table.cartId),
    index("cart_items_product_id_idx").on(table.productId),
  ],
);

// --- DRIZZLE RELATIONS ---
export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

// --- TYPE INFERENCES ---
export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
