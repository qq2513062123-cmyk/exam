export type ScorableQuestionType = "single_choice" | "true_false" | "short_answer";

export type ScoreInput = {
  type: ScorableQuestionType;
  answer: string | null;
  correct_answer: string | null;
  score: number;
};

export type ScoreResult = {
  is_correct: boolean | null;
  auto_score: number | null;
  manual_score: number | null;
  final_score: number | null;
  review_status: "none" | "pending_review" | "reviewed";
};

export function scoreAnswer(input: ScoreInput): ScoreResult {
  if (input.type === "short_answer") {
    return {
      is_correct: null,
      auto_score: null,
      manual_score: null,
      final_score: null,
      review_status: "pending_review"
    };
  }

  const isCorrect = input.answer !== null && input.answer === input.correct_answer;
  const finalScore = isCorrect ? input.score : 0;

  return {
    is_correct: isCorrect,
    auto_score: finalScore,
    manual_score: null,
    final_score: finalScore,
    review_status: "none"
  };
}
