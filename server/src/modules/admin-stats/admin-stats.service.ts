import { query } from "../../config/db";
import { AdminStats, QuestionWrongRateItem } from "./admin-stats.types";

type BaseStatsRow = {
  published_exam_count: string;
  submission_count: string;
  unique_student_count: string;
  pending_review_count: string;
};

type ScoreStatsRow = {
  average_score: string | null;
  pass_rate: string | null;
};

type WrongRateRow = {
  question_id: string;
  stem: string;
  wrong_count: string;
  total_answered_count: string;
  wrong_rate: string;
};

function toNumber(value: string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

export async function getAdminStats(): Promise<AdminStats> {
  const baseStatsResult = await query<BaseStatsRow>(
    `
      SELECT
        (SELECT COUNT(*)::text FROM exams WHERE status = 'published') AS published_exam_count,
        (SELECT COUNT(*)::text FROM submissions) AS submission_count,
        (SELECT COUNT(DISTINCT student_id)::text FROM submissions) AS unique_student_count,
        (SELECT COUNT(*)::text FROM submissions WHERE status = 'pending_review') AS pending_review_count
    `
  );

  const scoreStatsResult = await query<ScoreStatsRow>(
    `
      SELECT
        COALESCE(AVG(total_score), 0)::numeric(10, 2)::text AS average_score,
        COALESCE(
          COUNT(*) FILTER (WHERE total_score >= 60)::numeric / NULLIF(COUNT(*), 0),
          0
        )::numeric(10, 4)::text AS pass_rate
      FROM submissions
      WHERE status = 'graded'
    `
  );

  const wrongRateResult = await query<WrongRateRow>(
    `
      SELECT
        q.id AS question_id,
        q.stem,
        COUNT(*) FILTER (WHERE sa.is_correct = false)::text AS wrong_count,
        COUNT(*)::text AS total_answered_count,
        (
          COUNT(*) FILTER (WHERE sa.is_correct = false)::numeric / NULLIF(COUNT(*), 0)
        )::numeric(10, 4)::text AS wrong_rate
      FROM submission_answers sa
      INNER JOIN questions q ON q.id = sa.question_id
      WHERE q.type IN ('single_choice', 'true_false')
        AND sa.answer IS NOT NULL
      GROUP BY q.id, q.stem
      HAVING COUNT(*) > 0
      ORDER BY wrong_rate DESC, wrong_count DESC, total_answered_count DESC
      LIMIT 10
    `
  );

  const baseStats = baseStatsResult.rows[0];
  const scoreStats = scoreStatsResult.rows[0];

  return {
    published_exam_count: toNumber(baseStats.published_exam_count),
    submission_count: toNumber(baseStats.submission_count),
    unique_student_count: toNumber(baseStats.unique_student_count),
    pending_review_count: toNumber(baseStats.pending_review_count),
    average_score: toNumber(scoreStats.average_score),
    pass_rate: toNumber(scoreStats.pass_rate),
    question_wrong_rate_top10: wrongRateResult.rows.map<QuestionWrongRateItem>((row) => ({
      question_id: row.question_id,
      stem: row.stem,
      wrong_count: toNumber(row.wrong_count),
      total_answered_count: toNumber(row.total_answered_count),
      wrong_rate: toNumber(row.wrong_rate)
    }))
  };
}
