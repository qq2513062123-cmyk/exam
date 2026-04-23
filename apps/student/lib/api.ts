import { API_BASE_URL, getToken } from "./auth";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ExamListItem = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  start_time: string | null;
  end_time: string | null;
  status: "published";
};

export type ExamQuestion = {
  exam_question_id: string;
  question_id: string;
  type: "single_choice" | "true_false" | "short_answer";
  stem: string;
  options: unknown | null;
  score: number;
  sort_order: number;
};

export type ExamDetail = ExamListItem & {
  questions: ExamQuestion[];
};

export type Submission = {
  id: string;
  exam_id: string;
  student_id: string;
  status: "in_progress" | "submitted" | "pending_review" | "graded";
  started_at: string;
  submitted_at: string | null;
  total_score: number | null;
  objective_score: number | null;
  subjective_score: number | null;
};

export type SubmissionAnswer = {
  question_id: string;
  answer: string | null;
  review_status: "none" | "pending_review" | "reviewed";
  final_score: number | null;
  auto_score: number | null;
  manual_score: number | null;
};

export type SubmissionDetail = Submission & {
  exam: {
    id: string;
    title: string;
    description: string | null;
    duration_minutes: number;
    start_time: string | null;
    end_time: string | null;
    status: "draft" | "published" | "closed";
  };
  questions: ExamQuestion[];
  answers: SubmissionAnswer[];
};

export type HistoryItem = Submission & {
  exam: {
    id: string;
    title: string;
    description: string | null;
    duration_minutes: number;
    start_time: string | null;
    end_time: string | null;
    status: "draft" | "published" | "closed";
  };
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

export function getStudentExams() {
  return request<{ exams: ExamListItem[] }>("/exams");
}

export function getStudentExam(id: string) {
  return request<{ exam: ExamDetail }>(`/exams/${id}`);
}

export function startSubmission(examId: string) {
  return request<{ submission: Submission }>("/submissions/start", {
    method: "POST",
    body: JSON.stringify({ examId })
  });
}

export function getSubmissionDetail(submissionId: string) {
  return request<{ submission: SubmissionDetail }>(`/submissions/${submissionId}`);
}

export function saveSubmissionAnswers(
  submissionId: string,
  answers: Array<{ questionId: string; answer: string | null }>
) {
  return request<{ submission: SubmissionDetail }>(`/submissions/${submissionId}/save`, {
    method: "POST",
    body: JSON.stringify({ answers })
  });
}

export function submitSubmission(submissionId: string) {
  return request<{ submission: SubmissionDetail }>(`/submissions/${submissionId}/submit`, {
    method: "POST"
  });
}

export function getStudentHistory() {
  return request<{ submissions: HistoryItem[] }>("/student/history");
}
