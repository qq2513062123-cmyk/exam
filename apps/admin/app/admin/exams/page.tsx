"use client";

import { FormEvent, useEffect, useState } from "react";
import { CalendarRange, Link2 } from "lucide-react";

import PageIntro from "../../../components/PageIntro";
import { Alert } from "../../../components/ui/alert";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { EmptyState } from "../../../components/ui/empty-state";
import { ErrorState } from "../../../components/ui/error-state";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { LoadingState } from "../../../components/ui/loading-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Textarea } from "../../../components/ui/textarea";
import {
  bindExamQuestions,
  createExam,
  Exam,
  ExamStatus,
  listExams,
  listQuestions,
  Question,
  updateExam
} from "../../../lib/api";

type ExamForm = {
  title: string;
  description: string;
  duration_minutes: string;
  status: ExamStatus;
};

const emptyForm: ExamForm = {
  title: "",
  description: "",
  duration_minutes: "60",
  status: "draft"
};

function statusVariant(status: ExamStatus) {
  if (status === "published") return "success" as const;
  if (status === "closed") return "destructive" as const;
  return "secondary" as const;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("zh-CN");
}

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [form, setForm] = useState<ExamForm>(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [bindExamId, setBindExamId] = useState("");
  const [bindQuestionIds, setBindQuestionIds] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [examData, questionData] = await Promise.all([listExams(), listQuestions()]);
      setExams(examData.exams);
      setQuestions(questionData.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载考试数据失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        duration_minutes: Number(form.duration_minutes),
        status: form.status
      };

      if (editingId) {
        await updateExam(editingId, payload);
        setMessage("考试已更新。");
      } else {
        await createExam(payload);
        setMessage("考试已创建。");
      }

      setForm(emptyForm);
      setEditingId("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存考试失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleBind() {
    setError("");
    setMessage("");

    try {
      const ids = bindQuestionIds
        .split(/[\n,\s]+/)
        .map((item) => item.trim())
        .filter(Boolean);

      if (!bindExamId || ids.length === 0) {
        throw new Error("请选择考试，并至少输入一个 question_id。");
      }

      await bindExamQuestions(bindExamId, ids);
      setMessage("题目已绑定到考试。");
      setBindQuestionIds("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "绑定题目失败");
    }
  }

  return (
    <section className="space-y-8">
      <PageIntro
        eyebrow="Exam Management"
        title="考试管理"
        description="创建考试、设置考试状态、绑定题目内容，让考试从题库走向可发布的正式配置。"
      />

      {message ? <Alert tone="success">{message}</Alert> : null}
      {error ? <Alert>{error}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr,0.9fr]">
        <Card className="rounded-[30px] border-slate-200 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CalendarRange className="h-5 w-5 text-blue-700" />
              {editingId ? "编辑考试" : "创建考试"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">标题</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                    required
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">时长（分钟）</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={form.duration_minutes}
                    onChange={(event) => setForm({ ...form, duration_minutes: event.target.value })}
                    required
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  className="rounded-2xl border-slate-200 bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as ExamStatus })}
                  className="flex h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                >
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                  <option value="closed">closed</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button disabled={saving}>{saving ? "保存中..." : editingId ? "保存编辑" : "创建考试"}</Button>
                {editingId ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId("");
                      setForm(emptyForm);
                    }}
                  >
                    取消编辑
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border-slate-200 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Link2 className="h-5 w-5 text-blue-700" />
              绑定题目
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bindExamId">选择考试</Label>
              <select
                id="bindExamId"
                value={bindExamId}
                onChange={(event) => setBindExamId(event.target.value)}
                className="flex h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
              >
                <option value="">请选择考试</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bindQuestionIds">question_id 列表</Label>
              <Textarea
                id="bindQuestionIds"
                value={bindQuestionIds}
                onChange={(event) => setBindQuestionIds(event.target.value)}
                placeholder="输入多个 question_id，可使用换行、空格或逗号分隔"
                className="rounded-2xl border-slate-200 bg-slate-50"
              />
            </div>

            <Button type="button" onClick={handleBind}>
              绑定题目
            </Button>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">可用题目 ID</p>
              <div className="max-h-56 space-y-2 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                {questions.map((question) => (
                  <p key={question.id}>
                    {question.id} - {question.stem}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[30px] border-slate-200 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <CardHeader>
          <CardTitle className="text-2xl">考试列表</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? <LoadingState title="正在加载考试数据" description="考试信息与题目绑定关系正在同步。" /> : null}
          {!loading && error ? <ErrorState description={error} /> : null}
          {!loading && !error && exams.length === 0 ? (
            <EmptyState title="还没有考试" description="先创建一场考试，再去绑定题目。" />
          ) : null}

          {!loading && !error && exams.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>时长</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="w-[120px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-slate-950">{exam.title}</p>
                        <p className="text-xs text-slate-500">{exam.description || "暂无描述"}</p>
                      </div>
                    </TableCell>
                    <TableCell>{exam.duration_minutes} 分钟</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(exam.status)}>{exam.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(exam.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(exam.id);
                          setForm({
                            title: exam.title,
                            description: exam.description || "",
                            duration_minutes: String(exam.duration_minutes),
                            status: exam.status
                          });
                        }}
                      >
                        编辑
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
