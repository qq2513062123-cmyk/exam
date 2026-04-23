import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import * as submissionsController from "./submissions.controller";

const router = Router();

router.use(requireAuth);
router.use(requireRole("student"));

router.post("/start", submissionsController.startSubmission);
router.post("/:id/save", submissionsController.saveAnswers);
router.post("/:id/submit", submissionsController.submitSubmission);
router.get("/:id", submissionsController.getSubmission);

export default router;
