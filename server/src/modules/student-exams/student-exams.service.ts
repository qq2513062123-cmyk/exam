import { query } from "../../config/db";
import { AppError } from "../../utils/errors";
import {
  StudentExam,
  StudentExamDetail,
  StudentExamQuestion
} from "./student-exams.types";

export async function listPublishedExams(): Promise<StudentExam[]> {
  const result = await query<StudentExam>(
    `
      SELECT id, title, description, duration_minutes, start_time, end_time, status,
             created_at, updated_at
      FROM exams
      WHERE status = 'published'
      ORDER BY created_at DESC
    `
  );

  return result.rows;
}

async function getPublishedExamById(id: string): Promise<StudentExam> {
  const result = await query<StudentExam & { actual_status: string }>(
    `
      SELECT id, title, description, duration_minutes, start_time, end_time, status,
             status AS actual_status, created_at, updated_at
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

  if (exam.actual_status !== "published") {
    throw new AppError("Exam is not published", 403);
  }

  return exam;
}

export async function getPublishedExamDetail(id: string): Promise<StudentExamDetail> {
  const exam = await getPublishedExamById(id);
  const questionsResult = await query<StudentExamQuestion>(
    `
      SELECT
        eq.id AS exam_question_id,
        q.id AS question_id,
        q.type,
        q.stem,
        q.options,
        eq.score,
        eq.sort_order
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

export async function ensurePublishedExamCanStart(id: string): Promise<void> {
  await getPublishedExamById(id);

  const questionCountResult = await query<{ count: string }>(
    `
      SELECT COUNT(*)::text AS count
      FROM exam_questions
      WHERE exam_id = $1
    `,
    [id]
  );

  if (Number(questionCountResult.rows[0].count) === 0) {
    throw new AppError("Exam has no questions", 400);
  }
}
