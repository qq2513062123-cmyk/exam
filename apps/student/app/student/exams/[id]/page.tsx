"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, Clock3, FileText, Save, SendHorizonal } from "lucide-react";

import PageIntro from "../../../../components/PageIntro";
import { Alert } from "../../../../components/ui/alert";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { ErrorState } from "../../../../components/ui/error-state";
import { LoadingState } from "../../../../components/ui/loading-state";
import { Textarea } from "../../../../components/ui/textarea";
import {
  ExamDetail,
  ExamQuestion,
  getStudentExam,
  getSubmissionDetail,
  saveSubmissionAnswers,
  startSubmission,
  Submission,
  submitSubmission
} from "../../../../lib/api";

type AnswerState = Record<string, string>;

function normalizeOptions(options: unknown): Array<{ label: string; value: string }> {
  if (Array.isArray(options)) {
    return options.map((item, index) => {
      const label = String(item);
      const match = label.match(/^([A-Za-z])[\.)\s]/);

      return {
        label,
        value: match?.[1] || String.fromCharCode(65 + index)
      };
    });
  }

  if (options && typeof options === "object") {
    return Object.entries(options as Record<string, unknown>).map(([key, value]) => ({
      label: `${key}. ${String(value)}`,
      value: key
    }));
  }

  return [];
}

function answersToState(savedAnswers: Array<{ question_id: string; answer: string | null }>): AnswerState {
  return savedAnswers.reduce<AnswerState>((result, item) => {
    if (item.answer !== null) {
      result[item.question_id] = item.answer;
    }

    return result;
  }, {});
}

function statusVariant(status?: Submission["status"]) {
  if (status === "graded") return "success" as const;
  if (status === "pending_review") return "warning" as const;
  if (status === "in_progress") return "default" as const;
  return "secondary" as const;
}

function formatRemainingTime(milliseconds: number) {
  const safeMilliseconds = Math.max(0, milliseconds);
  const totalSeconds = Math.floor(safeMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function QuestionInput({
  question,
  value,
  disabled,
  onChange
}: {
  question: ExamQuestion;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  if (question.type === "single_choice") {
    const options = normalizeOptions(question.options);

    return (
      <div className="mt-5 grid gap-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
              value === option.value
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <input
              type="radio"
              name={question.question_id}
              value={option.value}
              checked={value === option.value}
              disabled={disabled}
              onChange={(event) => onChange(event.target.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.type === "true_false") {
    return (
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {[
          { label: "正确", value: "true" },
          { label: "错误", value: "false" }
        ].map((option) => (
          <label
            key={option.value}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
              value === option.value
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <input
              type="radio"
              name={question.question_id}
              value={option.value}
              checked={value === option.value}
              disabled={disabled}
              onChange={(event) => onChange(event.target.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    );
  }

  return (
    <Textarea
      value={value}
      disabled={disabled}
      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
      className="mt-5 min-h-40 rounded-2xl"
      placeholder="请输入简答题答案"
    />
  );
}

export default function StudentExamPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const examId = params.id;

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const autoSubmittedRef = useRef(false);

  const canEdit = submission?.status === "in_progress";

  const remainingMilliseconds = useMemo(() => {
    if (!submission || !exam) {
      return null;
    }

    const startedAt = new Date(submission.started_at).getTime();
    const durationMilliseconds = exam.duration_minutes * 60 * 1000;

    return startedAt + durationMilliseconds - now;
  }, [exam, now, submission]);

  const timeExpired = remainingMilliseconds !== null && remainingMilliseconds <= 0;

  const answerPayload = useMemo(
    () =>
      (exam?.questions || []).map((question) => ({
        questionId: question.question_id,
        answer: answers[question.question_id] || null
      })),
    [answers, exam]
  );

  useEffect(() => {
    async function loadExam() {
      try {
        const examData = await getStudentExam(examId);
        setExam(examData.exam);

        const startData = await startSubmission(examId);
        const detailData = await getSubmissionDetail(startData.submission.id);

        setSubmission(detailData.submission);
        setAnswers(answersToState(detailData.submission.answers));

        if (detailData.submission.status !== "in_progress") {
          setMessage("该考试已提交，当前页面仅用于查看答案与状态。");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载考试失败");
      } finally {
        setLoading(false);
      }
    }

    loadExam();
  }, [examId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!submission || !canEdit || !timeExpired || autoSubmittedRef.current) {
      return;
    }

    autoSubmittedRef.current = true;
    void handleSubmit(true);
  }, [canEdit, submission, timeExpired]);

  function updateAnswer(questionId: string, value: string) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  async function handleSave() {
    if (!submission || !canEdit) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const data = await saveSubmissionAnswers(submission.id, answerPayload);
      setAnswers(answersToState(data.submission.answers));
      setMessage("答案已保存。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(autoSubmit = false) {
    if (!submission || !canEdit) return;
    if (!autoSubmit && !window.confirm("确认提交试卷？提交后将不能再修改答案。")) return;

    setSubmitting(true);
    setError("");
    setMessage(autoSubmit ? "考试时间已到，正在自动提交试卷。" : "");

    try {
      await saveSubmissionAnswers(submission.id, answerPayload);
      await submitSubmission(submission.id);
      router.push("/student/history");
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState title="正在加载考试内容" description="题目和作答状态正在同步。" />;
  }

  if (error && !exam) {
    return <ErrorState description={error} />;
  }

  if (!exam) {
    return <ErrorState title="考试不存在" description="当前考试未找到，可能已被移除或无权访问。" />;
  }

  return (
    <section className="space-y-8">
      <PageIntro
        eyebrow="Exam Workspace"
        title={exam.title}
        description={exam.description || "请在规定时间内完成作答，并在确认后正式提交试卷。"}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr,0.9fr]">
        <Card className="rounded-[30px] border-slate-200 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div className="flex flex-wrap items-center gap-5 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-blue-700" />
                时长 {exam.duration_minutes} 分钟
              </span>
              <span className="inline-flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-700" />
                共 {exam.questions.length} 题
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {remainingMilliseconds !== null ? (
                <div className={`rounded-2xl border px-4 py-2 text-sm font-semibold ${
                  timeExpired
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-blue-100 bg-blue-50 text-blue-700"
                }`}>
                  剩余 {formatRemainingTime(remainingMilliseconds)}
                </div>
              ) : null}
              <Badge variant={statusVariant(submission?.status)}>{submission?.status || "unknown"}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border-slate-200 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardContent className="p-6 text-sm leading-7 text-slate-600">
            {canEdit
              ? "进入考试后开始计时。你可以先保存当前答案，倒计时结束后系统会自动提交。"
              : `当前试卷状态为 ${submission?.status || "unknown"}，页面仅显示答案内容，不再允许修改。`}
          </CardContent>
        </Card>
      </div>

      {message ? <Alert tone="success">{message}</Alert> : null}
      {error ? <Alert>{error}</Alert> : null}

      {!canEdit && submission ? (
        <Alert tone="info">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <span>当前试卷已锁定，你可以查看答案和状态，但不能再修改或重新提交。</span>
          </div>
        </Alert>
      ) : null}

      <div className="space-y-5">
        {exam.questions.map((question, index) => (
          <Card key={question.question_id} className="rounded-[30px] border-slate-200 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">第 {index + 1} 题</Badge>
                    <Badge variant="outline">{question.type}</Badge>
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{question.stem}</h2>
                </div>

                <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  {question.score} 分
                </div>
              </div>

              <QuestionInput
                question={question}
                value={answers[question.question_id] || ""}
                disabled={!canEdit || timeExpired}
                onChange={(value) => updateAnswer(question.question_id, value)}
              />

              <p className="mt-4 text-sm text-slate-500">当前答案：{answers[question.question_id] || "未作答"}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="sticky bottom-4 rounded-[30px] border-slate-200 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {canEdit
              ? `剩余 ${remainingMilliseconds === null ? "--:--" : formatRemainingTime(remainingMilliseconds)}，可以先保存答案，再正式提交试卷。`
              : "当前试卷已锁定，不能继续编辑。"}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSave} disabled={!canEdit || timeExpired || saving || submitting}>
              <Save className="h-4 w-4" />
              {saving ? "保存中..." : "保存答案"}
            </Button>
            <Button onClick={() => void handleSubmit(false)} disabled={!canEdit || saving || submitting}>
              <SendHorizonal className="h-4 w-4" />
              {submitting ? "提交中..." : "提交试卷"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
