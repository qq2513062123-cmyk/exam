import { query } from "../../config/db";
import { AppError } from "../../utils/errors";
import {
  CreateQuestionInput,
  Question,
  QuestionType,
  UpdateQuestionInput
} from "./questions.types";

type QuestionDraft = {
  type: QuestionType;
  stem: string;
  options?: unknown | null;
  correct_answer?: string | null;
  score: number;
};

function hasOptions(options: unknown | null | undefined): boolean {
  if (options === null || options === undefined) {
    return false;
  }

  if (Array.isArray(options)) {
    return options.length > 0;
  }

  if (typeof options === "object") {
    return Object.keys(options).length > 0;
  }

  return false;
}

function hasCorrectAnswer(answer: string | null | undefined): boolean {
  return typeof answer === "string" && answer.trim().length > 0;
}

function validateQuestionRules(input: QuestionDraft): void {
  if (input.score < 0) {
    throw new AppError("score must be greater than or equal to 0", 400);
  }

  if (input.type === "single_choice") {
    if (!hasOptions(input.options)) {
      throw new AppError("single_choice questions require options", 400);
    }

    if (!hasCorrectAnswer(input.correct_answer)) {
      throw new AppError("single_choice questions require correct_answer", 400);
    }
  }

  if (input.type === "true_false") {
    if (input.correct_answer !== "true" && input.correct_answer !== "false") {
      throw new AppError('true_false correct_answer must be "true" or "false"', 400);
    }
  }
}

export async function listQuestions(type?: QuestionType): Promise<Question[]> {
  if (type) {
    const result = await query<Question>(
      `
        SELECT id, type, stem, options, correct_answer, score, created_by, created_at, updated_at
        FROM questions
        WHERE type = $1
        ORDER BY created_at DESC
      `,
      [type]
    );

    return result.rows;
  }

  const result = await query<Question>(
    `
      SELECT id, type, stem, options, correct_answer, score, created_by, created_at, updated_at
      FROM questions
      ORDER BY created_at DESC
    `
  );

  return result.rows;
}

export async function createQuestion(input: CreateQuestionInput): Promise<Question> {
  validateQuestionRules(input);

  const result = await query<Question>(
    `
      INSERT INTO questions (type, stem, options, correct_answer, score, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, type, stem, options, correct_answer, score, created_by, created_at, updated_at
    `,
    [
      input.type,
      input.stem,
      input.options ?? null,
      input.correct_answer ?? null,
      input.score,
      input.created_by
    ]
  );

  return result.rows[0];
}

export async function getQuestionById(id: string): Promise<Question> {
  const result = await query<Question>(
    `
      SELECT id, type, stem, options, correct_answer, score, created_by, created_at, updated_at
      FROM questions
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  const question = result.rows[0];

  if (!question) {
    throw new AppError("Question not found", 404);
  }

  return question;
}

export async function updateQuestion(
  id: string,
  input: UpdateQuestionInput
): Promise<Question> {
  const current = await getQuestionById(id);

  const next = {
    type: input.type ?? current.type,
    stem: input.stem ?? current.stem,
    options: input.options !== undefined ? input.options : current.options,
    correct_answer:
      input.correct_answer !== undefined ? input.correct_answer : current.correct_answer,
    score: input.score ?? current.score
  };

  validateQuestionRules(next);

  const result = await query<Question>(
    `
      UPDATE questions
      SET
        type = $1,
        stem = $2,
        options = $3,
        correct_answer = $4,
        score = $5
      WHERE id = $6
      RETURNING id, type, stem, options, correct_answer, score, created_by, created_at, updated_at
    `,
    [next.type, next.stem, next.options ?? null, next.correct_answer ?? null, next.score, id]
  );

  return result.rows[0];
}
