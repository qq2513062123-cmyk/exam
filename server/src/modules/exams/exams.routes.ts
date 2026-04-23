import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import * as examsController from "./exams.controller";

const router = Router();

router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/", examsController.listExams);
router.post("/", examsController.createExam);
router.get("/:id", examsController.getExam);
router.patch("/:id", examsController.updateExam);
router.post("/:id/questions", examsController.bindQuestions);

export default router;
