import { pgTable, text, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { medicinesTable } from "./medicines";

export const barcodeMappingsTable = pgTable("barcode_mappings", {
  id: uuid("id").primaryKey().defaultRandom(),
  barcode: text("barcode").notNull().unique(),
  medicineId: uuid("medicine_id").references(() => medicinesTable.id),
  confirmedCount: integer("confirmed_count").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBarcodeMappingSchema = createInsertSchema(barcodeMappingsTable).omit({ id: true, createdAt: true });
export type InsertBarcodeMapping = z.infer<typeof insertBarcodeMappingSchema>;
export type BarcodeMapping = typeof barcodeMappingsTable.$inferSelect;
