import { query } from "../../config/db";
import { StudentHistoryItem } from "./student-history.types";

type StudentHistoryRow = {
  id: string;
  exam_id: string;
  status: "in_progress" | "submitted" | "pending_review" | "graded";
  started_at: Date;
  submitted_at: Date | null;
  total_score: number | null;
  objective_score: number | null;
  subjective_score: number | null;
  created_at: Date;
  updated_at: Date;
  exam_title: string;
  exam_description: string | null;
  duration_minutes: number;
  start_time: Date | null;
  end_time: Date | null;
  exam_status: "draft" | "published" | "closed";
};

export async function listStudentHistory(studentId: string): Promise<StudentHistoryItem[]> {
  const result = await query<StudentHistoryRow>(
    `
      SELECT
        s.id,
        s.exam_id,
        s.status,
        s.started_at,
        s.submitted_at,
        s.total_score,
        s.objective_score,
        s.subjective_score,
        s.created_at,
        s.updated_at,
        e.title AS exam_title,
        e.description AS exam_description,
        e.duration_minutes,
        e.start_time,
        e.end_time,
        e.status AS exam_status
      FROM submissions s
      INNER JOIN exams e ON e.id = s.exam_id
      WHERE s.student_id = $1
      ORDER BY COALESCE(s.submitted_at, s.created_at) DESC
    `,
    [studentId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    exam_id: row.exam_id,
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
      title: row.exam_title,
      description: row.exam_description,
      duration_minutes: row.duration_minutes,
      start_time: row.start_time,
      end_time: row.end_time,
      status: row.exam_status
    }
  }));
}
