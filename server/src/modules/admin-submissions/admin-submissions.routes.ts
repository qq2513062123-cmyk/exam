import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import * as adminSubmissionsController from "./admin-submissions.controller";

const router = Router();

router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/", adminSubmissionsController.listSubmissions);
router.get("/:id", adminSubmissionsController.getSubmission);
router.patch("/:id/review", adminSubmissionsController.reviewSubmission);

export default router;
