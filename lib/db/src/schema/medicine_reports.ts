import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const medicineReportsTable = pgTable("medicine_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  medicineName: text("medicine_name").notNull(),
  reportReason: text("report_reason").notNull(),
  description: text("description"),
  governorate: text("governorate"),
  pharmacyName: text("pharmacy_name"),
  imageUrl: text("image_url"),
  contactNumber: text("contact_number"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMedicineReportSchema = createInsertSchema(medicineReportsTable).omit({ id: true, createdAt: true, status: true });
export type InsertMedicineReport = z.infer<typeof insertMedicineReportSchema>;
export type MedicineReport = typeof medicineReportsTable.$inferSelect;
