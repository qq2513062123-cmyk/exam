export type StudentExam = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  start_time: Date | null;
  end_time: Date | null;
  status: "published";
  created_at: Date;
  updated_at: Date;
};

export type StudentExamQuestion = {
  exam_question_id: string;
  question_id: string;
  type: "single_choice" | "true_false" | "short_answer";
  stem: string;
  options: unknown | null;
  score: number;
  sort_order: number;
};

export type StudentExamDetail = StudentExam & {
  questions: StudentExamQuestion[];
};
