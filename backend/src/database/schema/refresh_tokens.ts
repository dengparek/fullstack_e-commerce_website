import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Storing hashed tokens (e.g. SHA-256) prevents leaks if database is compromised
    tokenHash: text("token_hash").notNull().unique(),

    // Capturing user context assists with security auditing and remote logout
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),

    isRevoked: boolean("is_revoked").notNull().default(false),

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Performance indexes for authentication checks & token cleanup jobs
    index("refresh_tokens_user_id_idx").on(table.userId),
    index("refresh_tokens_expires_at_idx").on(table.expiresAt),
  ],
);

// --- DRIZZLE RELATIONS ---
export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

// --- TYPE INFERENCES ---
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
