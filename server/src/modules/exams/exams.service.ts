import { query } from "../../config/db";
import { AppError } from "../../utils/errors";
import {
  BindExamQuestionInput,
  CreateExamInput,
  Exam,
  ExamDetail,
  ExamQuestion,
  UpdateExamInput
} from "./exams.types";

type QuestionScoreRow = {
  id: string;
  score: number;
};

function validateTimeRange(startTime?: string | null, endTime?: string | null): void {
  if (!startTime || !endTime) {
    return;
  }

  if (new Date(endTime).getTime() <= new Date(startTime).getTime()) {
    throw new AppError("end_time must be greater than start_time", 400);
  }
}

function assertNoDuplicateQuestionIds(questions: BindExamQuestionInput[]): void {
  const ids = questions.map((item) => item.question_id);
  const uniqueIds = new Set(ids);

  if (uniqueIds.size !== ids.length) {
    throw new AppError("Duplicate question_id in request", 400);
  }
}

export async function listExams(): Promise<Exam[]> {
  const result = await query<Exam>(
    `
      SELECT id, title, description, duration_minutes, start_time, end_time, status,
             created_by, created_at, updated_at
      FROM exams
      ORDER BY created_at DESC
    `
  );

  return result.rows;
}

export async function createExam(input: CreateExamInput): Promise<Exam> {
  validateTimeRange(input.start_time, input.end_time);

  const result = await query<Exam>(
    `
      INSERT INTO exams (
        title, description, duration_minutes, start_time, end_time, status, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, title, description, duration_minutes, start_time, end_time, status,
                created_by, created_at, updated_at
    `,
    [
      input.title,
      input.description ?? null,
      input.duration_minutes,
      input.start_time ?? null,
      input.end_time ?? null,
      input.status ?? "draft",
      input.created_by
    ]
  );

  return result.rows[0];
}

export async function getExamById(id: string): Promise<Exam> {
  const result = await query<Exam>(
    `
      SELECT id, title, description, duration_minutes, start_time, end_time, status,
             created_by, created_at, updated_at
      FROM exams
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  const exam = result.rows[0];

  if (!exam) {
    throw new AppError("Exam not found", 404);
  }

  return exam;
}

export async function getExamDetail(id: string): Promise<ExamDetail> {
  const exam = await getExamById(id);
  const questionsResult = await query<ExamQuestion>(
    `
      SELECT
        eq.id AS exam_question_id,
        q.id AS question_id,
        q.type,
        q.stem,
        q.options,
        q.correct_answer,
        q.score AS question_score,
        eq.score,
        eq.sort_order,
        eq.created_at
      FROM exam_questions eq
      INNER JOIN questions q ON q.id = eq.question_id
      WHERE eq.exam_id = $1
      ORDER BY eq.sort_order ASC, eq.created_at ASC
    `,
    [id]
  );

  return {
    ...exam,
    questions: questionsResult.rows
  };
}

export async function updateExam(id: string, input: UpdateExamInput): Promise<Exam> {
  const current = await getExamById(id);

  const next = {
    title: input.title ?? current.title,
    description: input.description !== undefined ? input.description : current.description,
    duration_minutes: input.duration_minutes ?? current.duration_minutes,
    start_time: input.start_time !== undefined ? input.start_time : current.start_time,
    end_time: input.end_time !== undefined ? input.end_time : current.end_time,
    status: input.status ?? current.status
  };

  validateTimeRange(
    next.start_time instanceof Date ? next.start_time.toISOString() : next.start_time,
    next.end_time instanceof Date ? next.end_time.toISOString() : next.end_time
  );

  const result = await query<Exam>(
    `
      UPDATE exams
      SET
        title = $1,
        description = $2,
        duration_minutes = $3,
        start_time = $4,
        end_time = $5,
        status = $6
      WHERE id = $7
      RETURNING id, title, description, duration_minutes, start_time, end_time, status,
                created_by, created_at, updated_at
    `,
    [
      next.title,
      next.description,
      next.duration_minutes,
      next.start_time,
      next.end_time,
      next.status,
      id
    ]
  );

  return result.rows[0];
}

export async function bindQuestionsToExam(
  examId: string,
  questions: BindExamQuestionInput[]
): Promise<ExamDetail> {
  await getExamById(examId);
  assertNoDuplicateQuestionIds(questions);

  const questionIds = questions.map((item) => item.question_id);

  const questionResult = await query<QuestionScoreRow>(
    `
      SELECT id, score
      FROM questions
      WHERE id = ANY($1::uuid[])
    `,
    [questionIds]
  );

  if (questionResult.rows.length !== questionIds.length) {
    throw new AppError("One or more questions do not exist", 400);
  }

  const existingResult = await query<{ question_id: string }>(
    `
      SELECT question_id
      FROM exam_questions
      WHERE exam_id = $1 AND question_id = ANY($2::uuid[])
    `,
    [examId, questionIds]
  );

  if (existingResult.rows.length > 0) {
    throw new AppError("One or more questions are already bound to this exam", 409);
  }

  const scoreMap = new Map(questionResult.rows.map((item) => [item.id, item.score]));

  for (const [index, item] of questions.entries()) {
    await query(
      `
        INSERT INTO exam_questions (exam_id, question_id, sort_order, score)
        VALUES ($1, $2, $3, $4)
      `,
      [
        examId,
        item.question_id,
        item.sort_order ?? index,
        item.score ?? scoreMap.get(item.question_id)
      ]
    );
  }

  return getExamDetail(examId);
}
