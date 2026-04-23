export type StudentHistoryItem = {
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
  exam: {
    id: string;
    title: string;
    description: string | null;
    duration_minutes: number;
    start_time: Date | null;
    end_time: Date | null;
    status: "draft" | "published" | "closed";
  };
};
