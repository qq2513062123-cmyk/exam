export type ExamStatus = "draft" | "published" | "closed";

export type Exam = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  start_time: Date | null;
  end_time: Date | null;
  status: ExamStatus;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
};

export type ExamQuestion = {
  exam_question_id: string;
  question_id: string;
  type: "single_choice" | "true_false" | "short_answer";
  stem: string;
  options: unknown | null;
  correct_answer: string | null;
  question_score: number;
  score: number;
  sort_order: number;
  created_at: Date;
};

export type ExamDetail = Exam & {
  questions: ExamQuestion[];
};

export type CreateExamInput = {
  title: string;
  description?: string | null;
  duration_minutes: number;
  start_time?: string | null;
  end_time?: string | null;
  status?: ExamStatus;
  created_by: string;
};

export type UpdateExamInput = {
  title?: string;
  description?: string | null;
  duration_minutes?: number;
  start_time?: string | null;
  end_time?: string | null;
  status?: ExamStatus;
};

export type BindExamQuestionInput = {
  question_id: string;
  sort_order?: number;
  score?: number;
};
