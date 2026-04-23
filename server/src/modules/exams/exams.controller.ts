import { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { sendSuccess } from "../../utils/response";
import * as examsService from "./exams.service";

const examStatusSchema = z.enum(["draft", "published", "closed"]);
const optionalDateTimeSchema = z.string().datetime().nullable().optional();

const paramsSchema = z.object({
  id: z.string().uuid()
});

const createExamSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  duration_minutes: z.number().int().positive(),
  start_time: optionalDateTimeSchema,
  end_time: optionalDateTimeSchema,
  status: examStatusSchema.optional()
});

const updateExamSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    duration_minutes: z.number().int().positive().optional(),
    start_time: optionalDateTimeSchema,
    end_time: optionalDateTimeSchema,
    status: examStatusSchema.optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
  });

const bindQuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        question_id: z.string().uuid(),
        sort_order: z.number().int().min(0).optional(),
        score: z.number().int().min(0).optional()
      })
    )
    .min(1)
});

export async function listExams(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const exams = await examsService.listExams();

    sendSuccess(res, { exams });
  } catch (error) {
    next(error);
  }
}

export async function createExam(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = createExamSchema.parse(req.body);
    const exam = await examsService.createExam({
      ...body,
      created_by: req.user!.userId
    });

    sendSuccess(res, { exam }, "ok", 201);
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
    const exam = await examsService.getExamDetail(params.id);

    sendSuccess(res, { exam });
  } catch (error) {
    next(error);
  }
}

export async function updateExam(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const params = paramsSchema.parse(req.params);
    const body = updateExamSchema.parse(req.body);
    const exam = await examsService.updateExam(params.id, body);

    sendSuccess(res, { exam });
  } catch (error) {
    next(error);
  }
}

export async function bindQuestions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const params = paramsSchema.parse(req.params);
    const body = bindQuestionsSchema.parse(req.body);
    const exam = await examsService.bindQuestionsToExam(params.id, body.questions);

    sendSuccess(res, { exam });
  } catch (error) {
    next(error);
  }
}
