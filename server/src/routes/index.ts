import { Router } from "express";

import adminStatsRoutes from "../modules/admin-stats/admin-stats.routes";
import adminSubmissionsRoutes from "../modules/admin-submissions/admin-submissions.routes";
import authRoutes from "../modules/auth/auth.routes";
import examsRoutes from "../modules/exams/exams.routes";
import questionsRoutes from "../modules/questions/questions.routes";
import studentExamsRoutes from "../modules/student-exams/student-exams.routes";
import studentHistoryRoutes from "../modules/student-history/student-history.routes";
import submissionsRoutes from "../modules/submissions/submissions.routes";
import { sendSuccess } from "../utils/response";

const router = Router();

router.get("/health", (_req, res) => {
  sendSuccess(res, { success: true });
});

router.use("/auth", authRoutes);
router.use("/admin/exams", examsRoutes);
router.use("/admin/questions", questionsRoutes);
router.use("/admin", adminStatsRoutes);
router.use("/admin/submissions", adminSubmissionsRoutes);
router.use("/exams", studentExamsRoutes);
router.use("/student", studentHistoryRoutes);
router.use("/submissions", submissionsRoutes);

export default router;
