"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";

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
import {
  AdminSubmissionDetail,
  AdminSubmissionListItem,
  getAdminSubmission,
  listAdminSubmissions,
  reviewSubmission
} from "../../../lib/api";

type ReviewState = Record<string, { manual_score: string; reviewer_comment: string }>;
type StatusFilter = "all" | "in_progress" | "pending_review" | "graded";

const PAGE_SIZE = 10;

function statusVariant(status: AdminSubmissionListItem["status"]) {
  if (status === "graded") {
    return "success" as const;
  }

  if (status === "pending_review") {
    return "warning" as const;
  }

  return "secondary" as const;
}

function formatScore(value: number | null) {
  return value === null ? "待出分" : String(value);
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<AdminSubmissionListItem[]>([]);
  const [selected, setSelected] = useState<AdminSubmissionDetail | null>(null);
  const [reviewState, setReviewState] = useState<ReviewState>({});
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [listError, setListError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [message, setMessage] = useState("");

  async function loadList() {
    setLoading(true);
    setListError("");

    try {
      const data = await listAdminSubmissions();
      setSubmissions(data.submissions);
    } catch (error) {
      setListError(error instanceof Error ? error.message : "加载提交记录失败");
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(id: string) {
    setDetailLoading(true);
    setDetailError("");
    setMessage("");

    try {
      const data = await getAdminSubmission(id);
      setSelected(data.submission);

      const nextReviewState: ReviewState = {};
      data.submission.answers.forEach((answer) => {
        if (answer.type === "short_answer") {
          nextReviewState[answer.question_id] = {
            manual_score: answer.manual_score === null ? "" : String(answer.manual_score),
            reviewer_comment: answer.reviewer_comment || ""
          };
        }
      });

      setReviewState(nextReviewState);
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : "加载提交详情失败");
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    loadList();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const filteredSubmissions = useMemo(() => {
    if (statusFilter === "all") {
      return submissions;
    }

    return submissions.filter((submission) => submission.status === statusFilter);
  }, [submissions, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedSubmissions = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredSubmissions.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredSubmissions, page]);

  async function handleReview() {
    if (!selected) {
      return;
    }

    const answers = selected.answers
      .filter((answer) => answer.type === "short_answer" && answer.review_status === "pending_review")
      .map((answer) => ({
        questionId: answer.question_id,
        manual_score: Number(reviewState[answer.question_id]?.manual_score || 0),
        reviewer_comment: reviewState[answer.question_id]?.reviewer_comment || null
      }));

    if (answers.length === 0) {
      setDetailError("没有待复核的简答题。");
      return;
    }

    setSaving(true);
    setDetailError("");
    setMessage("");

    try {
      await reviewSubmission(selected.id, answers);
      setMessage("复核结果已保存。");
      await loadList();
      await loadDetail(selected.id);
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : "复核失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-8">
      <PageIntro
        eyebrow="Submissions"
        title="提交记录与复核"
        description="按状态查看学生提交记录，通过本地分页提升浏览效率，并在右侧详情区完成简答题人工复核。"
      />

      {message ? <Alert tone="success">{message}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[1.08fr,0.92fr]">
        <Card className="rounded-[30px] border-slate-200 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ClipboardList className="h-5 w-5 text-blue-700" />
                提交列表
              </CardTitle>

              <div className="flex flex-wrap items-center gap-2">
                {(["all", "in_progress", "pending_review", "graded"] as StatusFilter[]).map((item) => (
                  <Button
                    key={item}
                    type="button"
                    size="sm"
                    variant={statusFilter === item ? "default" : "outline"}
                    onClick={() => setStatusFilter(item)}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {loading ? <LoadingState title="正在加载提交记录" description="请稍候，列表数据正在准备。" /> : null}
            {!loading && listError ? <ErrorState description={listError} /> : null}
            {!loading && !listError && filteredSubmissions.length === 0 ? (
              <EmptyState
                title={submissions.length === 0 ? "还没有提交记录" : "没有匹配的提交记录"}
                description={
                  submissions.length === 0 ? "等待学生提交试卷后，这里会出现记录。" : "可以切换其他状态继续查看。"
                }
              />
            ) : null}

            {!loading && !listError && filteredSubmissions.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>考试</TableHead>
                      <TableHead>学生</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>总分</TableHead>
                      <TableHead className="w-[120px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>{submission.exam.title}</TableCell>
                        <TableCell>{submission.student.name || submission.student.email}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(submission.status)}>{submission.status}</Badge>
                        </TableCell>
                        <TableCell>{formatScore(submission.total_score)}</TableCell>
                        <TableCell>
                          <Button type="button" size="sm" variant="outline" onClick={() => loadDetail(submission.id)}>
                            查看
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Pagination page={page} pageSize={PAGE_SIZE} total={filteredSubmissions.length} onPageChange={setPage} />
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border-slate-200 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="text-2xl">提交详情 / 复核</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {detailError ? <Alert>{detailError}</Alert> : null}
            {detailLoading ? <LoadingState title="正在加载详情" description="答案和复核表单马上展示出来。" /> : null}
            {!selected && !detailLoading ? (
              <EmptyState title="请选择一条提交记录" description="点击左侧列表中的查看按钮，这里会展示详细答案与复核区域。" />
            ) : null}

            {selected ? (
              <>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="font-medium text-slate-950">{selected.exam.title}</p>
                  <p className="mt-1 text-sm text-slate-600">学生：{selected.student.name || selected.student.email}</p>
                  <div className="mt-3">
                    <Badge variant={statusVariant(selected.status)}>{selected.status}</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  {selected.answers.map((answer, index) => (
                    <Card key={answer.question_id} className="rounded-[24px] border-dashed border-slate-200 bg-slate-50/70 shadow-none">
                      <CardContent className="space-y-3 p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">第 {index + 1} 题</Badge>
                          <Badge variant="secondary">{answer.type}</Badge>
                          <Badge variant="default">{answer.score} 分</Badge>
                          {answer.review_status === "pending_review" ? <Badge variant="warning">待复核</Badge> : null}
                        </div>

                        <p className="font-medium text-slate-950">{answer.stem}</p>
                        <p className="text-sm text-slate-600">学生答案：{answer.answer || "未作答"}</p>
                        <p className="text-sm text-slate-600">正确答案：{answer.correct_answer || "无"}</p>
                        <p className="text-sm text-slate-600">当前得分：{formatScore(answer.final_score)}</p>

                        {answer.type === "short_answer" && answer.review_status === "pending_review" ? (
                          <div className="grid gap-3">
                            <div className="space-y-2">
                              <Label htmlFor={`score-${answer.question_id}`}>人工分</Label>
                              <Input
                                id={`score-${answer.question_id}`}
                                type="number"
                                min="0"
                                max={answer.score}
                                value={reviewState[answer.question_id]?.manual_score || ""}
                                onChange={(event) =>
                                  setReviewState({
                                    ...reviewState,
                                    [answer.question_id]: {
                                      ...reviewState[answer.question_id],
                                      manual_score: event.target.value
                                    }
                                  })
                                }
                                className="h-12 rounded-2xl border-slate-200 bg-white px-4"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`comment-${answer.question_id}`}>复核备注</Label>
                              <Input
                                id={`comment-${answer.question_id}`}
                                value={reviewState[answer.question_id]?.reviewer_comment || ""}
                                onChange={(event) =>
                                  setReviewState({
                                    ...reviewState,
                                    [answer.question_id]: {
                                      ...reviewState[answer.question_id],
                                      reviewer_comment: event.target.value
                                    }
                                  })
                                }
                                className="h-12 rounded-2xl border-slate-200 bg-white px-4"
                              />
                            </div>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button onClick={handleReview} disabled={saving}>
                  {saving ? "保存复核中..." : "保存复核"}
                </Button>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
