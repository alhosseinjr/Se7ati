import { Router } from "express";
import { db } from "@workspace/db";
import { medicinesTable, barcodeMappingsTable, scanLogsTable } from "@workspace/db";
import {
  SearchMedicinesQueryParams,
  GetMedicineByBarcodeParams,
  GetMedicineParams,
  SubmitBarcodeMappingBody,
} from "@workspace/api-zod";
import { eq, or, ilike, sql } from "drizzle-orm";

const router = Router();

// GET /medicines/search?q=...&type=...
router.get("/medicines/search", async (req, res) => {
  const parseResult = SearchMedicinesQueryParams.safeParse(req.query);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  const { q, type = "name" } = parseResult.data;

  try {
    const medicines = await db
      .select()
      .from(medicinesTable)
      .where(
        or(
          ilike(medicinesTable.tradeNameEn, `%${q}%`),
          ilike(medicinesTable.tradeNameAr, `%${q}%`),
          ilike(medicinesTable.genericName, `%${q}%`)
        )
      )
      .limit(20);

    // Log the scan
    await db.insert(scanLogsTable).values({
      searchQuery: q,
      searchType: type,
      resultFound: medicines.length > 0,
    }).catch(() => {});

    return res.json(medicines.map(m => ({
      id: m.id,
      tradeNameEn: m.tradeNameEn,
      tradeNameAr: m.tradeNameAr,
      genericName: m.genericName,
      applicantName: m.applicantName,
      dosageForm: m.dosageForm,
      registrationNumber: m.registrationNumber,
      barcode: m.barcode,
      isVerified: m.isVerified,
      source: m.source,
      createdAt: m.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Error searching medicines");
    return res.status(500).json({ error: "Search failed" });
  }
});

// GET /medicines/barcode/:barcode
router.get("/medicines/barcode/:barcode", async (req, res) => {
  const parseResult = GetMedicineByBarcodeParams.safeParse(req.params);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid barcode" });
  }

  const { barcode } = parseResult.data;

  try {
    // Check barcode_mappings first
    const mapping = await db
      .select()
      .from(barcodeMappingsTable)
      .where(eq(barcodeMappingsTable.barcode, barcode))
      .limit(1);

    if (mapping.length > 0 && mapping[0].medicineId) {
      const medicine = await db
        .select()
        .from(medicinesTable)
        .where(eq(medicinesTable.id, mapping[0].medicineId))
        .limit(1);

      if (medicine.length > 0) {
        const m = medicine[0];
        return res.json({
          found: true,
          medicine: {
            id: m.id,
            tradeNameEn: m.tradeNameEn,
            tradeNameAr: m.tradeNameAr,
            genericName: m.genericName,
            applicantName: m.applicantName,
            dosageForm: m.dosageForm,
            registrationNumber: m.registrationNumber,
            barcode: m.barcode,
            isVerified: m.isVerified,
            source: m.source,
            createdAt: m.createdAt.toISOString(),
          }
        });
      }
    }

    // Check medicines table directly
    const medicine = await db
      .select()
      .from(medicinesTable)
      .where(eq(medicinesTable.barcode, barcode))
      .limit(1);

    if (medicine.length > 0) {
      const m = medicine[0];
      return res.json({
        found: true,
        medicine: {
          id: m.id,
          tradeNameEn: m.tradeNameEn,
          tradeNameAr: m.tradeNameAr,
          genericName: m.genericName,
          applicantName: m.applicantName,
          dosageForm: m.dosageForm,
          registrationNumber: m.registrationNumber,
          barcode: m.barcode,
          isVerified: m.isVerified,
          source: m.source,
          createdAt: m.createdAt.toISOString(),
        }
      });
    }

    return res.status(404).json({ found: false, message: "باركود غير معروف" });
  } catch (err) {
    req.log.error({ err }, "Error looking up barcode");
    return res.status(500).json({ error: "Lookup failed" });
  }
});

// GET /medicines/:id
router.get("/medicines/:id", async (req, res) => {
  const parseResult = GetMedicineParams.safeParse(req.params);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const { id } = parseResult.data;

  try {
    const medicine = await db
      .select()
      .from(medicinesTable)
      .where(eq(medicinesTable.id, id))
      .limit(1);

    if (medicine.length === 0) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    const m = medicine[0];
    return res.json({
      id: m.id,
      tradeNameEn: m.tradeNameEn,
      tradeNameAr: m.tradeNameAr,
      genericName: m.genericName,
      applicantName: m.applicantName,
      dosageForm: m.dosageForm,
      registrationNumber: m.registrationNumber,
      barcode: m.barcode,
      isVerified: m.isVerified,
      source: m.source,
      createdAt: m.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting medicine");
    return res.status(500).json({ error: "Failed to get medicine" });
  }
});

// POST /medicines/barcode-map
router.post("/medicines/barcode-map", async (req, res) => {
  const parseResult = SubmitBarcodeMappingBody.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { barcode, medicineId } = parseResult.data;

  try {
    await db
      .insert(barcodeMappingsTable)
      .values({ barcode, medicineId })
      .onConflictDoUpdate({
        target: barcodeMappingsTable.barcode,
        set: { confirmedCount: sql`${barcodeMappingsTable.confirmedCount} + 1` },
      });

    return res.status(201).json({ success: true, message: "تم حفظ الباركود بنجاح" });
  } catch (err) {
    req.log.error({ err }, "Error saving barcode mapping");
    return res.status(500).json({ error: "Failed to save mapping" });
  }
});

export default router;
