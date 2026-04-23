import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import * as studentHistoryController from "./student-history.controller";

const router = Router();

router.use(requireAuth);
router.use(requireRole("student"));

router.get("/history", studentHistoryController.listHistory);

export default router;
