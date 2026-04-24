import { API_BASE_URL, getToken } from "./auth";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type QuestionType = "single_choice" | "true_false" | "short_answer";
export type ExamStatus = "draft" | "published" | "closed";
export type SubmissionStatus = "in_progress" | "submitted" | "pending_review" | "graded";

export type Question = {
  id: string;
  type: QuestionType;
  stem: string;
  options: unknown | null;
  correct_answer: string | null;
  score: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Exam = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  start_time: string | null;
  end_time: string | null;
  status: ExamStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminSubmissionListItem = {
  id: string;
  exam_id: string;
  student_id: string;
  status: SubmissionStatus;
  total_score: number | null;
  objective_score: number | null;
  subjective_score: number | null;
  submitted_at: string | null;
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
  answers: Array<{
    question_id: string;
    type: QuestionType;
    stem: string;
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

export type AdminStats = {
  published_exam_count: number;
  submission_count: number;
  unique_student_count: number;
  pending_review_count: number;
  average_score: number;
  pass_rate: number;
  question_wrong_rate_top10: Array<{
    question_id: string;
    stem: string;
    wrong_count: number;
    total_answered_count: number;
    wrong_rate: number;
  }>;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  if (!token) {
    throw new Error("未登录");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  });

  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !result.success) {
    throw new Error(result.message || "请求失败");
  }

  return result.data;
}

export function listQuestions() {
  return request<{ questions: Question[] }>("/admin/questions");
}

export function createQuestion(input: {
  type: QuestionType;
  stem: string;
  options?: unknown | null;
  correct_answer?: string | null;
  score: number;
}) {
  return request<{ question: Question }>("/admin/questions", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updateQuestion(id: string, input: Partial<{
  type: QuestionType;
  stem: string;
  options: unknown | null;
  correct_answer: string | null;
  score: number;
}>) {
  return request<{ question: Question }>(`/admin/questions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function deleteQuestion(id: string) {
  return request<{ question: { id: string } }>(`/admin/questions/${id}`, {
    method: "DELETE"
  });
}

export function listExams() {
  return request<{ exams: Exam[] }>("/admin/exams");
}

export function createExam(input: {
  title: string;
  description?: string | null;
  duration_minutes: number;
  start_time?: string | null;
  end_time?: string | null;
  status?: ExamStatus;
}) {
  return request<{ exam: Exam }>("/admin/exams", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updateExam(id: string, input: Partial<{
  title: string;
  description: string | null;
  duration_minutes: number;
  start_time: string | null;
  end_time: string | null;
  status: ExamStatus;
}>) {
  return request<{ exam: Exam }>(`/admin/exams/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function bindExamQuestions(examId: string, questionIds: string[]) {
  return request<{ exam: Exam }>(`/admin/exams/${examId}/questions`, {
    method: "POST",
    body: JSON.stringify({
      questions: questionIds.map((questionId, index) => ({
        question_id: questionId,
        sort_order: index
      }))
    })
  });
}

export function listAdminSubmissions() {
  return request<{ submissions: AdminSubmissionListItem[] }>("/admin/submissions");
}

export function getAdminSubmission(id: string) {
  return request<{ submission: AdminSubmissionDetail }>(`/admin/submissions/${id}`);
}

export function reviewSubmission(
  id: string,
  answers: Array<{ questionId: string; manual_score: number; reviewer_comment?: string | null }>
) {
  return request<{ submission: AdminSubmissionDetail }>(`/admin/submissions/${id}/review`, {
    method: "PATCH",
    body: JSON.stringify({ answers })
  });
}

export function getAdminScores() {
  return request<{ stats: AdminStats }>("/admin/scores");
}
