import { pgTable, text, uuid, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const medicinesTable = pgTable("medicines", {
  id: uuid("id").primaryKey().defaultRandom(),
  tradeNameEn: text("trade_name_en"),
  tradeNameAr: text("trade_name_ar"),
  genericName: text("generic_name"),
  applicantName: text("applicant_name"),
  dosageForm: text("dosage_form"),
  registrationNumber: text("registration_number").unique(),
  barcode: text("barcode"),
  isVerified: boolean("is_verified").notNull().default(true),
  source: text("source").default("EDA"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMedicineSchema = createInsertSchema(medicinesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
export type Medicine = typeof medicinesTable.$inferSelect;
