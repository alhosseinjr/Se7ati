import { Router } from "express";
import { db } from "@workspace/db";
import { medicineReportsTable } from "@workspace/db";
import { CreateReportBody } from "@workspace/api-zod";

const router = Router();

// POST /reports
router.post("/reports", async (req, res) => {
  const parseResult = CreateReportBody.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid report data" });
  }

  const data = parseResult.data;

  try {
    await db.insert(medicineReportsTable).values({
      medicineName: data.medicineName,
      reportReason: data.reportReason,
      description: data.description ?? null,
      governorate: data.governorate ?? null,
      pharmacyName: data.pharmacyName ?? null,
      contactNumber: data.contactNumber ?? null,
    });

    return res.status(201).json({
      success: true,
      message: "تم استلام بلاغك بنجاح. شكراً لمساهمتك في حماية المجتمع.",
    });
  } catch (err) {
    req.log.error({ err }, "Error creating report");
    return res.status(500).json({ error: "Failed to create report" });
  }
});

export default router;
