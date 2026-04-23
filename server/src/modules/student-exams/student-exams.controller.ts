import { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { sendSuccess } from "../../utils/response";
import * as studentExamsService from "./student-exams.service";

const paramsSchema = z.object({
  id: z.string().uuid()
});

export async function listExams(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const exams = await studentExamsService.listPublishedExams();

    sendSuccess(res, { exams });
  } catch (error) {
    next(error);
  }
}

export async function getExam(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const params = paramsSchema.parse(req.params);
    const exam = await studentExamsService.getPublishedExamDetail(params.id);

    sendSuccess(res, { exam });
  } catch (error) {
    next(error);
  }
}
