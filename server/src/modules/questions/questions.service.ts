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

function normalizeTrueFalseAnswer(answer: string | null | undefined): string | null | undefined {
  if (answer === undefined || answer === null) {
    return answer;
  }

  const normalized = answer.trim().toLowerCase();

  if (normalized === "正确" || normalized === "对" || normalized === "true") {
    return "true";
  }

  if (normalized === "错误" || normalized === "错" || normalized === "false") {
    return "false";
  }

  return answer;
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
    const validTrueFalseAnswers = new Set(["true", "false", "正确", "错误"]);

    if (!validTrueFalseAnswers.has(input.correct_answer ?? "")) {
      throw new AppError('true_false correct_answer must be "true", "false", "正确" or "错误"', 400);
    }
  }
}

function serializeOptions(options: unknown | null | undefined) {
  if (options === undefined) {
    return undefined;
  }

  if (options === null) {
    return null;
  }

  return JSON.stringify(options);
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
  const normalizedInput = {
    ...input,
    correct_answer: input.type === "true_false" ? normalizeTrueFalseAnswer(input.correct_answer) : input.correct_answer
  };

  validateQuestionRules(normalizedInput);

  const result = await query<Question>(
    `
      INSERT INTO questions (type, stem, options, correct_answer, score, created_by)
      VALUES ($1, $2, $3::jsonb, $4, $5, $6)
      RETURNING id, type, stem, options, correct_answer, score, created_by, created_at, updated_at
    `,
    [
      normalizedInput.type,
      normalizedInput.stem,
      serializeOptions(normalizedInput.options) ?? null,
      normalizedInput.correct_answer ?? null,
      normalizedInput.score,
      normalizedInput.created_by
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

  const normalizedNext = {
    ...next,
    correct_answer: next.type === "true_false" ? normalizeTrueFalseAnswer(next.correct_answer) : next.correct_answer
  };

  validateQuestionRules(normalizedNext);

  const result = await query<Question>(
    `
      UPDATE questions
      SET
        type = $1,
        stem = $2,
        options = $3::jsonb,
        correct_answer = $4,
        score = $5
      WHERE id = $6
      RETURNING id, type, stem, options, correct_answer, score, created_by, created_at, updated_at
    `,
    [
      normalizedNext.type,
      normalizedNext.stem,
      serializeOptions(normalizedNext.options) ?? null,
      normalizedNext.correct_answer ?? null,
      normalizedNext.score,
      id
    ]
  );

  return result.rows[0];
}
