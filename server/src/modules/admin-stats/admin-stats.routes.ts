import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import * as adminStatsController from "./admin-stats.controller";

const router = Router();

router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/scores", adminStatsController.getScores);
router.get("/overview", adminStatsController.getOverview);

export default router;
