import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const whimseyChangelog = pgTable("whimsey_changelog", {
  id:          serial("id").primaryKey(),
  tool:        text("tool").notNull(),
  summary:     text("summary").notNull(),
  detail:      text("detail"),
  createdAt:   timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type WhimseyChangelog = typeof whimseyChangelog.$inferSelect;
export type InsertWhimseyChangelog = typeof whimseyChangelog.$inferInsert;
