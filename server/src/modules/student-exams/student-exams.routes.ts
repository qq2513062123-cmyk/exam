import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import * as studentExamsController from "./student-exams.controller";

const router = Router();

router.use(requireAuth);
router.use(requireRole("student"));

router.get("/", studentExamsController.listExams);
router.get("/:id", studentExamsController.getExam);

export default router;
