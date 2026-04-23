import { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { sendSuccess } from "../../utils/response";
import * as questionsService from "./questions.service";

const questionTypeSchema = z.enum(["single_choice", "true_false", "short_answer"]);

const listQuestionsSchema = z.object({
  type: questionTypeSchema.optional()
});

const createQuestionSchema = z.object({
  type: questionTypeSchema,
  stem: z.string().min(1),
  options: z.unknown().optional().nullable(),
  correct_answer: z.string().optional().nullable(),
  score: z.number().int().min(0)
});

const updateQuestionSchema = z
  .object({
    type: questionTypeSchema.optional(),
    stem: z.string().min(1).optional(),
    options: z.unknown().optional().nullable(),
    correct_answer: z.string().optional().nullable(),
    score: z.number().int().min(0).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
  });

const paramsSchema = z.object({
  id: z.string().uuid()
});

export async function listQuestions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = listQuestionsSchema.parse(req.query);
    const questions = await questionsService.listQuestions(query.type);

    sendSuccess(res, { questions });
  } catch (error) {
    next(error);
  }
}

export async function createQuestion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = createQuestionSchema.parse(req.body);
    const question = await questionsService.createQuestion({
      ...body,
      created_by: req.user!.userId
    });

    sendSuccess(res, { question }, "ok", 201);
  } catch (error) {
    next(error);
  }
}

export async function getQuestion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const params = paramsSchema.parse(req.params);
    const question = await questionsService.getQuestionById(params.id);

    sendSuccess(res, { question });
  } catch (error) {
    next(error);
  }
}

export async function updateQuestion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const params = paramsSchema.parse(req.params);
    const body = updateQuestionSchema.parse(req.body);
    const question = await questionsService.updateQuestion(params.id, body);

    sendSuccess(res, { question });
  } catch (error) {
    next(error);
  }
}
