import { relations } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  pgEnum,
  pgSequence,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { products } from "./products";
import { users } from "./users";

export const orderNumberSequence = pgSequence("order_number_seq", {
  startWith: 1,
  increment: 1,
});
// --------------------------------------------------
// ENUMS
// --------------------------------------------------

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

// --------------------------------------------------
// ORDERS TABLE
// --------------------------------------------------

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Human-readable order reference.
    orderNumber: varchar("order_number", { length: 30 }).notNull().unique(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),

    // Fulfillment status.
    status: orderStatusEnum("status").notNull().default("pending"),

    // Payment status is independent from fulfillment status.
    paymentStatus: paymentStatusEnum("payment_status")
      .notNull()
      .default("pending"),

    // Financial snapshot for the order.
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),

    taxAmount: numeric("tax_amount", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),

    shippingAmount: numeric("shipping_amount", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),

    discountAmount: numeric("discount_amount", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),

    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),

    // Shipping information is snapshotted at checkout.
    shippingName: varchar("shipping_name", { length: 200 }).notNull(),
    shippingPhone: varchar("shipping_phone", { length: 30 }).notNull(),
    shippingAddress: text("shipping_address").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("orders_user_id_idx").on(table.userId),
    index("orders_status_idx").on(table.status),
    index("orders_payment_status_idx").on(table.paymentStatus),
    // Composite index for fast user order history listing ordered by date
    index("orders_user_created_at_idx").on(table.userId, table.createdAt),
  ],
);

// --------------------------------------------------
// ORDER ITEMS TABLE
// --------------------------------------------------

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),

    // Nullable because original product may be soft/hard deleted.
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),

    // Historical product snapshots.
    productName: varchar("product_name", { length: 200 }).notNull(),
    productSku: varchar("product_sku", { length: 100 }),

    // Historical price at time of checkout.
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),

    quantity: integer("quantity").notNull(),

    // unitPrice * quantity at checkout.
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
    index("order_items_product_id_idx").on(table.productId),
    // Ensures a product is not added multiple times in the same order
    uniqueIndex("order_items_order_product_unique").on(
      table.orderId,
      table.productId,
    ),
  ],
);

// --------------------------------------------------
// DRIZZLE RELATIONS
// --------------------------------------------------

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// --------------------------------------------------
// TYPE INFERENCES
// --------------------------------------------------

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
