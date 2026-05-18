import { pgTable, text, uuid, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scanLogsTable = pgTable("scan_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  searchQuery: text("search_query"),
  searchType: text("search_type"),
  resultFound: boolean("result_found"),
  governorate: text("governorate"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertScanLogSchema = createInsertSchema(scanLogsTable).omit({ id: true, createdAt: true });
export type InsertScanLog = z.infer<typeof insertScanLogSchema>;
export type ScanLog = typeof scanLogsTable.$inferSelect;
