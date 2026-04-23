import { query, withTransaction } from "../../config/db";
import { AppError } from "../../utils/errors";
import {
  AdminSubmissionDetail,
  AdminSubmissionListItem,
  ReviewAnswerInput,
  SubmissionStatus
} from "./admin-submissions.types";

type SubmissionFilter = {
  exam_id?: string;
  student_id?: string;
  status?: SubmissionStatus;
};

type ListRow = {
  id: string;
  exam_id: string;
  student_id: string;
  status: SubmissionStatus;
  started_at: Date;
  submitted_at: Date | null;
  total_score: number | null;
  objective_score: number | null;
  subjective_score: number | null;
  created_at: Date;
  updated_at: Date;
  exam_title: string;
  student_email: string;
  student_name: string | null;
};

type DetailBaseRow = ListRow & {
  reviewed_by: string | null;
  reviewed_at: Date | null;
  exam_description: string | null;
  duration_minutes: number;
  start_time: Date | null;
  end_time: Date | null;
  exam_status: "draft" | "published" | "closed";
};

type AnswerRow = {
  question_id: string;
  type: "single_choice" | "true_false" | "short_answer";
  stem: string;
  options: unknown | null;
  correct_answer: string | null;
  score: number;
  answer: string | null;
  is_correct: boolean | null;
  auto_score: number | null;
  manual_score: number | null;
  final_score: number | null;
  review_status: "none" | "pending_review" | "reviewed";
  reviewer_comment: string | null;
};

type ReviewQuestionRow = {
  question_id: string;
  type: "single_choice" | "true_false" | "short_answer";
  score: number;
};

function mapListRow(row: ListRow): AdminSubmissionListItem {
  return {
    id: row.id,
    exam_id: row.exam_id,
    student_id: row.student_id,
    status: row.status,
    started_at: row.started_at,
    submitted_at: row.submitted_at,
    total_score: row.total_score,
    objective_score: row.objective_score,
    subjective_score: row.subjective_score,
    created_at: row.created_at,
    updated_at: row.updated_at,
    exam: {
      id: row.exam_id,
      title: row.exam_title
    },
    student: {
      id: row.student_id,
      email: row.student_email,
      name: row.student_name
    }
  };
}

export async function listSubmissions(
  filter: SubmissionFilter
): Promise<AdminSubmissionListItem[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filter.exam_id) {
    params.push(filter.exam_id);
    conditions.push(`s.exam_id = $${params.length}`);
  }

  if (filter.student_id) {
    params.push(filter.student_id);
    conditions.push(`s.student_id = $${params.length}`);
  }

  if (filter.status) {
    params.push(filter.status);
    conditions.push(`s.status = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await query<ListRow>(
    `
      SELECT
        s.id,
        s.exam_id,
        s.student_id,
        s.status,
        s.started_at,
        s.submitted_at,
        s.total_score,
        s.objective_score,
        s.subjective_score,
        s.created_at,
        s.updated_at,
        e.title AS exam_title,
        p.email AS student_email,
        p.name AS student_name
      FROM submissions s
      INNER JOIN exams e ON e.id = s.exam_id
      INNER JOIN profiles p ON p.id = s.student_id
      ${whereClause}
      ORDER BY COALESCE(s.submitted_at, s.created_at) DESC
    `,
    params
  );

  return result.rows.map(mapListRow);
}

export async function getSubmissionDetail(id: string): Promise<AdminSubmissionDetail> {
  const baseResult = await query<DetailBaseRow>(
    `
      SELECT
        s.id,
        s.exam_id,
        s.student_id,
        s.status,
        s.started_at,
        s.submitted_at,
        s.total_score,
        s.objective_score,
        s.subjective_score,
        s.reviewed_by,
        s.reviewed_at,
        s.created_at,
        s.updated_at,
        e.title AS exam_title,
        e.description AS exam_description,
        e.duration_minutes,
        e.start_time,
        e.end_time,
        e.status AS exam_status,
        p.email AS student_email,
        p.name AS student_name
      FROM submissions s
      INNER JOIN exams e ON e.id = s.exam_id
      INNER JOIN profiles p ON p.id = s.student_id
      WHERE s.id = $1
      LIMIT 1
    `,
    [id]
  );

  const base = baseResult.rows[0];

  if (!base) {
    throw new AppError("Submission not found", 404);
  }

  const answersResult = await query<AnswerRow>(
    `
      SELECT
        q.id AS question_id,
        q.type,
        q.stem,
        q.options,
        q.correct_answer,
        COALESCE(eq.score, q.score) AS score,
        sa.answer,
        sa.is_correct,
        sa.auto_score,
        sa.manual_score,
        sa.final_score,
        sa.review_status,
        sa.reviewer_comment
      FROM exam_questions eq
      INNER JOIN questions q ON q.id = eq.question_id
      LEFT JOIN submission_answers sa
        ON sa.question_id = q.id AND sa.submission_id = $1
      WHERE eq.exam_id = $2
      ORDER BY eq.sort_order ASC, eq.created_at ASC
    `,
    [id, base.exam_id]
  );

  return {
    ...mapListRow(base),
    reviewed_by: base.reviewed_by,
    reviewed_at: base.reviewed_at,
    exam: {
      id: base.exam_id,
      title: base.exam_title,
      description: base.exam_description,
      duration_minutes: base.duration_minutes,
      start_time: base.start_time,
      end_time: base.end_time,
      status: base.exam_status
    },
    answers: answersResult.rows
  };
}

function assertNoDuplicateReviewItems(answers: ReviewAnswerInput[]): void {
  const ids = answers.map((item) => item.questionId);

  if (new Set(ids).size !== ids.length) {
    throw new AppError("Duplicate questionId in review request", 400);
  }
}

export async function reviewSubmission(
  submissionId: string,
  adminId: string,
  answers: ReviewAnswerInput[]
): Promise<AdminSubmissionDetail> {
  assertNoDuplicateReviewItems(answers);

  await withTransaction(async (client) => {
    const submissionResult = await client.query<{
      id: string;
      exam_id: string;
      status: SubmissionStatus;
      objective_score: number | null;
    }>(
      `
        SELECT id, exam_id, status, objective_score
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

    if (submission.status === "in_progress") {
      throw new AppError("Submission has not been submitted", 400);
    }

    const questionIds = answers.map((item) => item.questionId);
    const questionsResult = await client.query<ReviewQuestionRow>(
      `
        SELECT q.id AS question_id, q.type, COALESCE(eq.score, q.score) AS score
        FROM exam_questions eq
        INNER JOIN questions q ON q.id = eq.question_id
        WHERE eq.exam_id = $1 AND q.id = ANY($2::uuid[])
      `,
      [submission.exam_id, questionIds]
    );

    if (questionsResult.rows.length !== questionIds.length) {
      throw new AppError("One or more questions do not belong to this submission", 400);
    }

    const questionMap = new Map(
      questionsResult.rows.map((item) => [item.question_id, item])
    );

    for (const item of answers) {
      const question = questionMap.get(item.questionId);

      if (!question) {
        throw new AppError("Question not found", 404);
      }

      if (question.type !== "short_answer") {
        throw new AppError("Only short_answer can be reviewed manually", 400);
      }

      if (item.manual_score > question.score) {
        throw new AppError("manual_score cannot exceed question score", 400);
      }

      const updateResult = await client.query(
        `
          UPDATE submission_answers
          SET
            manual_score = $1,
            final_score = $1,
            review_status = 'reviewed',
            reviewer_comment = $2,
            updated_at = now()
          WHERE submission_id = $3 AND question_id = $4
        `,
        [item.manual_score, item.reviewer_comment ?? null, submissionId, item.questionId]
      );

      if (updateResult.rowCount === 0) {
        throw new AppError("Submission answer not found", 404);
      }
    }

    const pendingResult = await client.query<{ count: string }>(
      `
        SELECT COUNT(*)::text AS count
        FROM submission_answers sa
        INNER JOIN questions q ON q.id = sa.question_id
        WHERE sa.submission_id = $1
          AND q.type = 'short_answer'
          AND sa.review_status = 'pending_review'
      `,
      [submissionId]
    );

    const subjectiveResult = await client.query<{ score: string | null }>(
      `
        SELECT COALESCE(SUM(sa.final_score), 0)::text AS score
        FROM submission_answers sa
        INNER JOIN questions q ON q.id = sa.question_id
        WHERE sa.submission_id = $1 AND q.type = 'short_answer'
      `,
      [submissionId]
    );

    const pendingCount = Number(pendingResult.rows[0].count);
    const subjectiveScore = Number(subjectiveResult.rows[0].score ?? 0);
    const objectiveScore = submission.objective_score ?? 0;
    const nextStatus = pendingCount > 0 ? "pending_review" : "graded";

    await client.query(
      `
        UPDATE submissions
        SET
          subjective_score = $1,
          total_score = $2,
          status = $3,
          reviewed_by = $4,
          reviewed_at = now()
        WHERE id = $5
      `,
      [subjectiveScore, objectiveScore + subjectiveScore, nextStatus, adminId, submissionId]
    );
  });

  return getSubmissionDetail(submissionId);
}
