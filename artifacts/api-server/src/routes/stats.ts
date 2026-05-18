import { Router } from "express";
import { db } from "@workspace/db";
import { medicinesTable, medicineReportsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

// GET /stats
router.get("/stats", async (_req, res) => {
  try {
    const [medicineResult, reportResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(medicinesTable),
      db.select({ count: sql<number>`count(*)::int` }).from(medicineReportsTable),
    ]);

    return res.json({
      medicineCount: medicineResult[0]?.count ?? 0,
      reportCount: reportResult[0]?.count ?? 0,
      userCount: 12847, // Static user count for MVP
    });
  } catch (err) {
    res.log?.error?.({ err }, "Error getting stats");
    return res.json({ medicineCount: 0, reportCount: 0, userCount: 0 });
  }
});

export default router;
