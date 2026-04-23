import { query, withTransaction } from "../../config/db";
import { AppError } from "../../utils/errors";
import { scoreAnswer } from "../../utils/scorer";
import { ensurePublishedExamCanStart } from "../student-exams/student-exams.service";
import {
  ExamQuestionForScoring,
  SaveAnswerInput,
  SavedAnswerRow,
  Submission,
  SubmissionAnswer,
  SubmissionDetail,
  SubmissionExam,
  SubmissionQuestion
} from "./submissions.types";

async function findSubmissionByExamAndStudent(
  examId: string,
  studentId: string
): Promise<Submission | null> {
  const result = await query<Submission>(
    `
      SELECT id, exam_id, student_id, status, started_at, submitted_at, total_score,
             objective_score, subjective_score, reviewed_by, reviewed_at, created_at, updated_at
      FROM submissions
      WHERE exam_id = $1 AND student_id = $2
      LIMIT 1
    `,
    [examId, studentId]
  );

  return result.rows[0] ?? null;
}

export async function startSubmission(
  examId: string,
  studentId: string
): Promise<Submission> {
  await ensurePublishedExamCanStart(examId);

  const existing = await findSubmissionByExamAndStudent(examId, studentId);

  if (existing) {
    return existing;
  }

  try {
    const result = await query<Submission>(
      `
        INSERT INTO submissions (exam_id, student_id, status)
        VALUES ($1, $2, 'in_progress')
        RETURNING id, exam_id, student_id, status, started_at, submitted_at, total_score,
                  objective_score, subjective_score, reviewed_by, reviewed_at,
                  created_at, updated_at
      `,
      [examId, studentId]
    );

    return result.rows[0];
  } catch (error) {
    const racedExisting = await findSubmissionByExamAndStudent(examId, studentId);

    if (racedExisting) {
      return racedExisting;
    }

    throw error;
  }
}

async function getSubmissionById(id: string): Promise<Submission> {
  const result = await query<Submission>(
    `
      SELECT id, exam_id, student_id, status, started_at, submitted_at, total_score,
             objective_score, subjective_score, reviewed_by, reviewed_at, created_at, updated_at
      FROM submissions
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  const submission = result.rows[0];

  if (!submission) {
    throw new AppError("Submission not found", 404);
  }

  return submission;
}

export async function getSubmissionDetail(
  id: string,
  studentId: string
): Promise<SubmissionDetail> {
  const submission = await getSubmissionById(id);

  if (submission.student_id !== studentId) {
    throw new AppError("Forbidden", 403);
  }

  const examResult = await query<SubmissionExam>(
    `
      SELECT id, title, description, duration_minutes, start_time, end_time, status
      FROM exams
      WHERE id = $1
      LIMIT 1
    `,
    [submission.exam_id]
  );

  const exam = examResult.rows[0];

  if (!exam) {
    throw new AppError("Exam not found", 404);
  }

  const questionsResult = await query<SubmissionQuestion>(
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
    [submission.exam_id]
  );

  const answersResult = await query<SubmissionAnswer>(
    `
      SELECT
        question_id,
        answer,
        review_status,
        final_score,
        auto_score,
        manual_score
      FROM submission_answers
      WHERE submission_id = $1
    `,
    [id]
  );

  return {
    ...submission,
    exam,
    questions: questionsResult.rows,
    answers: answersResult.rows
  };
}

async function getOwnedInProgressSubmission(
  id: string,
  studentId: string
): Promise<Submission> {
  const submission = await getSubmissionById(id);

  if (submission.student_id !== studentId) {
    throw new AppError("Forbidden", 403);
  }

  if (submission.status !== "in_progress") {
    throw new AppError("Submission is not in_progress", 400);
  }

  return submission;
}

async function assertQuestionsBelongToExam(
  examId: string,
  questionIds: string[]
): Promise<void> {
  const uniqueQuestionIds = Array.from(new Set(questionIds));

  const result = await query<{ question_id: string }>(
    `
      SELECT question_id
      FROM exam_questions
      WHERE exam_id = $1 AND question_id = ANY($2::uuid[])
    `,
    [examId, uniqueQuestionIds]
  );

  if (result.rows.length !== uniqueQuestionIds.length) {
    throw new AppError("One or more questions do not belong to this exam", 400);
  }
}

export async function saveAnswers(
  submissionId: string,
  studentId: string,
  answers: SaveAnswerInput[]
): Promise<SubmissionDetail> {
  const submission = await getOwnedInProgressSubmission(submissionId, studentId);

  await assertQuestionsBelongToExam(
    submission.exam_id,
    answers.map((item) => item.questionId)
  );

  await withTransaction(async (client) => {
    for (const item of answers) {
      await client.query(
        `
          INSERT INTO submission_answers (
            submission_id, question_id, answer, is_correct, auto_score,
            manual_score, final_score, review_status, reviewer_comment
          )
          VALUES ($1, $2, $3, NULL, NULL, NULL, NULL, 'none', NULL)
          ON CONFLICT (submission_id, question_id)
          DO UPDATE SET
            answer = EXCLUDED.answer,
            is_correct = NULL,
            auto_score = NULL,
            manual_score = NULL,
            final_score = NULL,
            review_status = 'none',
            reviewer_comment = NULL,
            updated_at = now()
        `,
        [submissionId, item.questionId, item.answer]
      );
    }
  });

  return getSubmissionDetail(submissionId, studentId);
}

export async function submitSubmission(
  submissionId: string,
  studentId: string
): Promise<SubmissionDetail> {
  await withTransaction(async (client) => {
    const submissionResult = await client.query<Submission>(
      `
        SELECT id, exam_id, student_id, status, started_at, submitted_at, total_score,
               objective_score, subjective_score, reviewed_by, reviewed_at,
               created_at, updated_at
        FROM submissions
        WHERE id = $1
        FOR UPDATE
      `,
      [submissionId]
    );

    const submission = submissionResult.rows[0];

    if (!submission) {
      throw new AppError("Submission not found", 404);
    }

    if (submission.student_id !== studentId) {
      throw new AppError("Forbidden", 403);
    }

    if (submission.status !== "in_progress") {
      throw new AppError("Submission is not in_progress", 400);
    }

    const questionsResult = await client.query<ExamQuestionForScoring>(
      `
        SELECT
          q.id AS question_id,
          q.type,
          q.correct_answer,
          COALESCE(eq.score, q.score) AS score
        FROM exam_questions eq
        INNER JOIN questions q ON q.id = eq.question_id
        WHERE eq.exam_id = $1
        ORDER BY eq.sort_order ASC, eq.created_at ASC
      `,
      [submission.exam_id]
    );

    if (questionsResult.rows.length === 0) {
      throw new AppError("Exam has no questions", 400);
    }

    const answersResult = await client.query<SavedAnswerRow>(
      `
        SELECT question_id, answer
        FROM submission_answers
        WHERE submission_id = $1
      `,
      [submissionId]
    );

    const answerMap = new Map(
      answersResult.rows.map((item) => [item.question_id, item.answer])
    );

    let objectiveScore = 0;
    let hasShortAnswer = false;

    for (const question of questionsResult.rows) {
      const answer = answerMap.get(question.question_id) ?? null;
      const scoreResult = scoreAnswer({
        type: question.type,
        answer,
        correct_answer: question.correct_answer,
        score: question.score
      });

      if (question.type === "short_answer") {
        hasShortAnswer = true;
      } else {
        objectiveScore += scoreResult.final_score ?? 0;
      }

      await client.query(
        `
          INSERT INTO submission_answers (
            submission_id, question_id, answer, is_correct, auto_score,
            manual_score, final_score, review_status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (submission_id, question_id)
          DO UPDATE SET
            answer = EXCLUDED.answer,
            is_correct = EXCLUDED.is_correct,
            auto_score = EXCLUDED.auto_score,
            manual_score = EXCLUDED.manual_score,
            final_score = EXCLUDED.final_score,
            review_status = EXCLUDED.review_status,
            updated_at = now()
        `,
        [
          submissionId,
          question.question_id,
          answer,
          scoreResult.is_correct,
          scoreResult.auto_score,
          scoreResult.manual_score,
          scoreResult.final_score,
          scoreResult.review_status
        ]
      );
    }

    await client.query(
      `
        UPDATE submissions
        SET
          status = $1,
          submitted_at = now(),
          objective_score = $2,
          subjective_score = $3,
          total_score = $4
        WHERE id = $5
      `,
      [
        hasShortAnswer ? "pending_review" : "graded",
        objectiveScore,
        hasShortAnswer ? null : 0,
        objectiveScore,
        submissionId
      ]
    );
  });

  return getSubmissionDetail(submissionId, studentId);
}
