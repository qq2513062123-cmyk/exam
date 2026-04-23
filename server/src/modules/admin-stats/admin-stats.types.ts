export type QuestionWrongRateItem = {
  question_id: string;
  stem: string;
  wrong_count: number;
  total_answered_count: number;
  wrong_rate: number;
};

export type AdminStats = {
  published_exam_count: number;
  submission_count: number;
  unique_student_count: number;
  pending_review_count: number;
  average_score: number;
  pass_rate: number;
  question_wrong_rate_top10: QuestionWrongRateItem[];
};
