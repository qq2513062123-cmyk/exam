export type SubmissionStatus = "in_progress" | "submitted" | "pending_review" | "graded";

export type Submission = {
  id: string;
  exam_id: string;
  student_id: string;
  status: SubmissionStatus;
  started_at: Date;
  submitted_at: Date | null;
  total_score: number | null;
  objective_score: number | null;
  subjective_score: number | null;
  reviewed_by: string | null;
  reviewed_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type SubmissionExam = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  start_time: Date | null;
  end_time: Date | null;
  status: "published" | "draft" | "closed";
};

export type SubmissionQuestion = {
  exam_question_id: string;
  question_id: string;
  type: "single_choice" | "true_false" | "short_answer";
  stem: string;
  options: unknown | null;
  score: number;
  sort_order: number;
};

export type SubmissionDetail = Submission & {
  exam: SubmissionExam;
  questions: SubmissionQuestion[];
  answers: SubmissionAnswer[];
};

export type SubmissionAnswer = {
  question_id: string;
  answer: string | null;
  review_status: "none" | "pending_review" | "reviewed";
  final_score: number | null;
  auto_score: number | null;
  manual_score: number | null;
};

export type SaveAnswerInput = {
  questionId: string;
  answer: string | null;
};

export type ExamQuestionForScoring = {
  question_id: string;
  type: "single_choice" | "true_false" | "short_answer";
  correct_answer: string | null;
  score: number;
};

export type SavedAnswerRow = {
  question_id: string;
  answer: string | null;
};
