import {
  boolean,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Self-referencing foreign key for nested subcategories
    parentId: uuid("parent_id"),

    name: varchar("name", { length: 100 }).notNull().unique(),

    slug: varchar("slug", { length: 120 }).notNull().unique(),

    description: text("description"),

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
    // Foreign key relationship for parent category with CASCADE or SET NULL on delete
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "categories_parent_id_fk",
    }).onDelete("set null"),

    // Index for parent lookups (e.g., getting all subcategories of a category)
    index("categories_parent_id_idx").on(table.parentId),

    // Composite index for fast public category lookup by slug
    index("categories_slug_is_active_idx").on(table.slug, table.isActive),
  ],
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
