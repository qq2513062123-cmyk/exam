export type SubmissionStatus = "in_progress" | "submitted" | "pending_review" | "graded";

export type AdminSubmissionListItem = {
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
  exam: {
    id: string;
    title: string;
  };
  student: {
    id: string;
    email: string;
    name: string | null;
  };
};

export type AdminSubmissionDetail = AdminSubmissionListItem & {
  reviewed_by: string | null;
  reviewed_at: Date | null;
  exam: AdminSubmissionListItem["exam"] & {
    description: string | null;
    duration_minutes: number;
    start_time: Date | null;
    end_time: Date | null;
    status: "draft" | "published" | "closed";
  };
  answers: Array<{
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
  }>;
};

export type ReviewAnswerInput = {
  questionId: string;
  manual_score: number;
  reviewer_comment?: string | null;
};
