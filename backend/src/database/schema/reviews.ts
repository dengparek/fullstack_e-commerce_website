import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { products } from "./products";
import { users } from "./users";

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    // Rating bounded between 1 and 5
    rating: integer("rating").notNull(),

    title: varchar("title", { length: 150 }),

    comment: text("comment"),

    // Indicates if the review comes from a confirmed buyer
    isVerifiedPurchase: boolean("is_verified_purchase")
      .notNull()
      .default(false),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Prevents a user from writing multiple reviews for the same product
    unique("user_product_review_unique").on(table.userId, table.productId),

    // Performance indexes for catalog review fetching and rating calculations
    index("reviews_product_id_idx").on(table.productId),
    index("reviews_user_id_idx").on(table.userId),
    index("reviews_rating_idx").on(table.rating),
  ],
);

// --- DRIZZLE RELATIONS ---
export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

// --- TYPE INFERENCES ---
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
