import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import * as questionsController from "./questions.controller";

const router = Router();

router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/", questionsController.listQuestions);
router.post("/", questionsController.createQuestion);
router.get("/:id", questionsController.getQuestion);
router.patch("/:id", questionsController.updateQuestion);
router.delete("/:id", questionsController.deleteQuestion);

export default router;
