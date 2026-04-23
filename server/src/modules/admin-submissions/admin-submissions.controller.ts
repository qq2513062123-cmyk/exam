import { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { sendSuccess } from "../../utils/response";
import * as adminSubmissionsService from "./admin-submissions.service";

const statusSchema = z.enum(["in_progress", "submitted", "pending_review", "graded"]);

const listQuerySchema = z.object({
  exam_id: z.string().uuid().optional(),
  student_id: z.string().uuid().optional(),
  status: statusSchema.optional()
});

const paramsSchema = z.object({
  id: z.string().uuid()
});

const reviewSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        manual_score: z.number().int().min(0),
        reviewer_comment: z.string().nullable().optional()
      })
    )
    .min(1)
});

export async function listSubmissions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filter = listQuerySchema.parse(req.query);
    const submissions = await adminSubmissionsService.listSubmissions(filter);

    sendSuccess(res, { submissions });
  } catch (error) {
    next(error);
  }
}

export async function getSubmission(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const params = paramsSchema.parse(req.params);
    const submission = await adminSubmissionsService.getSubmissionDetail(params.id);

    sendSuccess(res, { submission });
  } catch (error) {
    next(error);
  }
}

export async function reviewSubmission(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const params = paramsSchema.parse(req.params);
    const body = reviewSchema.parse(req.body);
    const submission = await adminSubmissionsService.reviewSubmission(
      params.id,
      req.user!.userId,
      body.answers
    );

    sendSuccess(res, { submission });
  } catch (error) {
    next(error);
  }
}
