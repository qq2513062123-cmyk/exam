export type QuestionType = "single_choice" | "true_false" | "short_answer";

export type Question = {
  id: string;
  type: QuestionType;
  stem: string;
  options: unknown | null;
  correct_answer: string | null;
  score: number;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
};

export type CreateQuestionInput = {
  type: QuestionType;
  stem: string;
  options?: unknown | null;
  correct_answer?: string | null;
  score: number;
  created_by: string;
};

export type UpdateQuestionInput = {
  type?: QuestionType;
  stem?: string;
  options?: unknown | null;
  correct_answer?: string | null;
  score?: number;
};
