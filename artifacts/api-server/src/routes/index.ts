import { Router, type IRouter } from "express";
import healthRouter from "./health";
import medicinesRouter from "./medicines";
import reportsRouter from "./reports";
import assistantRouter from "./assistant";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(medicinesRouter);
router.use(reportsRouter);
router.use(assistantRouter);
router.use(statsRouter);

export default router;
