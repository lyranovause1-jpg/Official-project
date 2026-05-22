import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const whimseyMemory = pgTable("whimsey_memory", {
  id:          serial("id").primaryKey(),
  category:    text("category").notNull(),
  memoryType:  text("memory_type").notNull(),
  subject:     text("subject").notNull(),
  headline:    text("headline").notNull(),
  content:     text("content").notNull(),
  importance:  integer("importance").notNull().default(5),
  tags:        text("tags"),
  sessionId:   text("session_id"),
  createdAt:   timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type WhimseyMemory = typeof whimseyMemory.$inferSelect;
export type InsertWhimseyMemory = typeof whimseyMemory.$inferInsert;
