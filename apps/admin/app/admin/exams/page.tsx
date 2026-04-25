"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle2, Eye, FilePlus2, Send } from "lucide-react";

import PageIntro from "../../../components/PageIntro";
import { Alert } from "../../../components/ui/alert";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { EmptyState } from "../../../components/ui/empty-state";
import { ErrorState } from "../../../components/ui/error-state";
import { LoadingState } from "../../../components/ui/loading-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Exam, ExamDetail, ExamStatus, getExam, listExams, updateExam } from "../../../lib/api";

function statusVariant(status: ExamStatus) {
  if (status === "published") return "success" as const;
  if (status === "closed") return "destructive" as const;
  return "secondary" as const;
}

function formatStatus(status: ExamStatus) {
  if (status === "published") return "已发布";
  if (status === "closed") return "已取消";
  return "草稿";
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("zh-CN");
}

export default function AdminExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [workingId, setWorkingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadExams(nextSelectedId?: string) {
    setLoading(true);
    setError("");

    try {
      const data = await listExams();
      setExams(data.exams);

      const fallbackId = nextSelectedId || selectedId || data.exams[0]?.id || "";

      if (fallbackId) {
        await loadDetail(fallbackId);
      } else {
        setSelectedId("");
        setDetail(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载考试列表失败");
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(examId: string) {
    setDetailLoading(true);

    try {
      const data = await getExam(examId);
      setSelectedId(data.exam.id);
      setDetail(data.exam);
    } catch (err) {
      setDetail(null);
      setError(err instanceof Error ? err.message : "加载考试详情失败");
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    void loadExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedExam = useMemo(
    () => exams.find((exam) => exam.id === selectedId) ?? null,
    [exams, selectedId]
  );

  async function changeStatus(exam: Exam, status: ExamStatus) {
    const label = status === "published" ? "发布" : "取消";

    if (status === "closed" && !window.confirm(`确定取消考试《${exam.title}》吗？学生将不能再进入。`)) {
      return;
    }

    setWorkingId(exam.id);
    setMessage("");
    setError("");

    try {
      const result = await updateExam(exam.id, { status });
      await loadExams(result.exam.id);
      setMessage(`考试《${result.exam.title}》已${label}。`);
    } catch (err) {
      setError(err instanceof Error ? err.message : `${label}考试失败`);
    } finally {
      setWorkingId("");
    }
  }

  return (
    <section className="space-y-6">
      <PageIntro
        eyebrow="Exam Management"
        title="考试管理"
        description="这里保留最短操作：查看试卷、发布考试、取消考试。新卷子从题库页导入后直接生成，不再在这里重复创建。"
      />

      {message ? <Alert tone="success">{message}</Alert> : null}
      {error ? <Alert>{error}</Alert> : null}

      <div className="grid gap-5 xl:grid-cols-[0.86fr,1.14fr]">
        <Card className="rounded-[28px] border-slate-200 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FilePlus2 className="h-5 w-5 text-blue-700" />
              从题库成卷
            </CardTitle>
            <CardDescription className="leading-7">
              导入题目、去重、勾选题目和命名试卷都在题库页完成。这里不再放第二套创建入口。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="h-11 rounded-2xl px-5" onClick={() => router.push("/admin/questions")}>
              去题库导入并成卷
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-slate-200 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CheckCircle2 className="h-5 w-5 text-blue-700" />
              当前试卷
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {detailLoading ? <LoadingState title="正在加载试卷" description="题目数量和状态正在同步。" /> : null}

            {!detailLoading && selectedExam ? (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-2">
                    <Badge variant={statusVariant(selectedExam.status)}>{formatStatus(selectedExam.status)}</Badge>
                    <h2 className="text-2xl font-semibold text-slate-950">{selectedExam.title}</h2>
                    <p className="text-sm leading-7 text-slate-600">
                      {selectedExam.description || "暂无考试说明"} · {selectedExam.duration_minutes} 分钟
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                    已绑定 <span className="font-semibold text-slate-950">{detail?.questions.length ?? 0}</span> 题
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    className="h-11 rounded-2xl px-5"
                    disabled={workingId === selectedExam.id || selectedExam.status === "published" || (detail?.questions.length ?? 0) === 0}
                    onClick={() => void changeStatus(selectedExam, "published")}
                  >
                    <Send className="h-4 w-4" />
                    发布考试
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-2xl px-5 border-red-200 text-red-700 hover:bg-red-50"
                    disabled={workingId === selectedExam.id || selectedExam.status === "closed"}
                    onClick={() => void changeStatus(selectedExam, "closed")}
                  >
                    <Ban className="h-4 w-4" />
                    取消考试
                  </Button>
                </div>
              </div>
            ) : null}

            {!detailLoading && !selectedExam ? (
              <EmptyState title="还没有试卷" description="先去题库页导入题目并一键成卷，生成后这里会展示考试。" />
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[28px] border-slate-200 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <CardHeader>
          <CardTitle className="text-2xl">考试列表</CardTitle>
          <CardDescription>列表里只保留核心操作：查看、发布、取消。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? <LoadingState title="正在加载考试列表" description="考试数据正在同步，请稍候。" /> : null}
          {!loading && error ? <ErrorState description={error} /> : null}
          {!loading && !error && exams.length === 0 ? (
            <EmptyState title="还没有考试" description="先去题库页导入题目并创建试卷。" />
          ) : null}

          {!loading && !error && exams.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>时长</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="w-[260px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-slate-950">{exam.title}</p>
                        <p className="text-xs text-slate-500">{exam.description || "暂无考试说明"}</p>
                      </div>
                    </TableCell>
                    <TableCell>{exam.duration_minutes} 分钟</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(exam.status)}>{formatStatus(exam.status)}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(exam.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => void loadDetail(exam.id)}>
                          <Eye className="h-4 w-4" />
                          查看
                        </Button>
                        {exam.status !== "published" ? (
                          <Button
                            type="button"
                            size="sm"
                            disabled={workingId === exam.id}
                            onClick={() => void changeStatus(exam, "published")}
                          >
                            发布
                          </Button>
                        ) : null}
                        {exam.status !== "closed" ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-700 hover:bg-red-50"
                            disabled={workingId === exam.id}
                            onClick={() => void changeStatus(exam, "closed")}
                          >
                            取消
                          </Button>
                        ) : null}
                      </div>
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
