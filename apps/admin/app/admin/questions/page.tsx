"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { FileQuestion, Search } from "lucide-react";

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
import { Pagination } from "../../../components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Textarea } from "../../../components/ui/textarea";
import { createQuestion, listQuestions, Question, QuestionType, updateQuestion } from "../../../lib/api";

type QuestionForm = {
  type: QuestionType;
  stem: string;
  optionsText: string;
  correct_answer: string;
  score: string;
};

const PAGE_SIZE = 10;

const emptyForm: QuestionForm = {
  type: "single_choice",
  stem: "",
  optionsText: '["A. 选项一", "B. 选项二"]',
  correct_answer: "A",
  score: "5"
};

function parseOptions(value: string): unknown | null {
  if (!value.trim()) {
    return null;
  }

  return JSON.parse(value);
}

function toForm(question: Question): QuestionForm {
  return {
    type: question.type,
    stem: question.stem,
    optionsText: question.options ? JSON.stringify(question.options, null, 2) : "",
    correct_answer: question.correct_answer || "",
    score: String(question.score)
  };
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("zh-CN");
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [form, setForm] = useState<QuestionForm>(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listError, setListError] = useState("");
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");

  async function loadQuestions() {
    setLoading(true);
    setListError("");

    try {
      const data = await listQuestions();
      setQuestions(data.questions);
    } catch (error) {
      setListError(error instanceof Error ? error.message : "加载题库失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [keyword]);

  const filteredQuestions = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return questions;
    }

    return questions.filter((question) => question.stem.toLowerCase().includes(normalizedKeyword));
  }, [questions, keyword]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedQuestions = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredQuestions.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredQuestions, page]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    setMessage("");

    try {
      const payload = {
        type: form.type,
        stem: form.stem,
        options: parseOptions(form.optionsText),
        correct_answer: form.correct_answer.trim() || null,
        score: Number(form.score)
      };

      if (editingId) {
        await updateQuestion(editingId, payload);
        setMessage("题目已更新。");
      } else {
        await createQuestion(payload);
        setMessage("题目已创建。");
      }

      setEditingId("");
      setForm(emptyForm);
      await loadQuestions();
    } catch (error) {
      if (error instanceof SyntaxError) {
        setFormError("options JSON 格式不正确，请先修正后再提交。");
      } else {
        setFormError(error instanceof Error ? error.message : "保存题目失败");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-8">
      <PageIntro
        eyebrow="Question Bank"
        title="题库管理"
        description="维护单选题、判断题和简答题，支持按题干关键词本地搜索，并通过分页提升列表浏览体验。"
      />

      {message ? <Alert tone="success">{message}</Alert> : null}
      {formError ? <Alert>{formError}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileQuestion className="h-5 w-5 text-blue-700" />
              {editingId ? "编辑题目" : "新增题目"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="type">题型</Label>
                  <select
                    id="type"
                    value={form.type}
                    onChange={(event) => setForm({ ...form, type: event.target.value as QuestionType })}
                    className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="single_choice">single_choice</option>
                    <option value="true_false">true_false</option>
                    <option value="short_answer">short_answer</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="stem">题干</Label>
                  <Input
                    id="stem"
                    value={form.stem}
                    onChange={(event) => setForm({ ...form, stem: event.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="optionsText">options JSON</Label>
                <Textarea
                  id="optionsText"
                  value={form.optionsText}
                  onChange={(event) => setForm({ ...form, optionsText: event.target.value })}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="correct_answer">correct_answer</Label>
                  <Input
                    id="correct_answer"
                    value={form.correct_answer}
                    onChange={(event) => setForm({ ...form, correct_answer: event.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="score">分值</Label>
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    value={form.score}
                    onChange={(event) => setForm({ ...form, score: event.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button disabled={saving}>{saving ? "保存中..." : editingId ? "保存编辑" : "创建题目"}</Button>
                {editingId ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId("");
                      setForm(emptyForm);
                      setMessage("");
                      setFormError("");
                    }}
                  >
                    取消编辑
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-2xl">题目列表</CardTitle>
              <div className="relative w-full md:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="按题干关键词搜索"
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {loading ? <LoadingState title="正在加载题库" description="请稍候，题目列表正在同步。" /> : null}
            {!loading && listError ? <ErrorState description={listError} /> : null}
            {!loading && !listError && filteredQuestions.length === 0 ? (
              <EmptyState
                title={questions.length === 0 ? "还没有题目" : "没有匹配的题目"}
                description={
                  questions.length === 0 ? "先创建一道题，题库会展示在这里。" : "可以换个关键词，或者清空搜索后再试。"
                }
              />
            ) : null}

            {!loading && !listError && filteredQuestions.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>题型</TableHead>
                      <TableHead>题干</TableHead>
                      <TableHead>分值</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead className="w-[120px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {pagedQuestions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell>
                          <Badge variant="outline">{question.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-slate-950">{question.stem}</p>
                            <p className="text-xs text-slate-500">{question.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>{question.score}</TableCell>
                        <TableCell>{formatDate(question.created_at)}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingId(question.id);
                              setForm(toForm(question));
                              setMessage("");
                              setFormError("");
                            }}
                          >
                            编辑
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Pagination page={page} pageSize={PAGE_SIZE} total={filteredQuestions.length} onPageChange={setPage} />
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
