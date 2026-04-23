import { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { sendSuccess } from "../../utils/response";
import * as submissionsService from "./submissions.service";

const startSubmissionSchema = z.object({
  examId: z.string().uuid()
});

const paramsSchema = z.object({
  id: z.string().uuid()
});

const answerItemSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.string().nullable()
});

const saveAnswersSchema = z.union([
  answerItemSchema,
  z.object({
    answers: z.array(answerItemSchema).min(1)
  })
]);

function normalizeSaveAnswers(input: z.infer<typeof saveAnswersSchema>) {
  if ("answers" in input) {
    return input.answers;
  }

  return [input];
}

export async function startSubmission(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = startSubmissionSchema.parse(req.body);
    const submission = await submissionsService.startSubmission(
      body.examId,
      req.user!.userId
    );

    sendSuccess(res, { submission });
  } catch (error) {
    next(error);
  }
}

export async function saveAnswers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const params = paramsSchema.parse(req.params);
    const body = saveAnswersSchema.parse(req.body);
    const submission = await submissionsService.saveAnswers(
      params.id,
      req.user!.userId,
      normalizeSaveAnswers(body)
    );

    sendSuccess(res, { submission });
  } catch (error) {
    next(error);
  }
}

export async function submitSubmission(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const params = paramsSchema.parse(req.params);
    const submission = await submissionsService.submitSubmission(
      params.id,
      req.user!.userId
    );

    sendSuccess(res, { submission });
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
    const submission = await submissionsService.getSubmissionDetail(
      params.id,
      req.user!.userId
    );

    sendSuccess(res, { submission });
  } catch (error) {
    next(error);
  }
}
