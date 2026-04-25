"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock3, FileText, LayoutGrid } from "lucide-react";

import PageIntro from "../../../components/PageIntro";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { EmptyState } from "../../../components/ui/empty-state";
import { ErrorState } from "../../../components/ui/error-state";
import { LoadingState } from "../../../components/ui/loading-state";
import { ExamListItem, getStudentExams } from "../../../lib/api";

function statusVariant(status: ExamListItem["status"]) {
  if (status === "published") {
    return "success" as const;
  }

  return "secondary" as const;
}

export default function StudentExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<ExamListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadExams() {
      setError("");

      try {
        const data = await getStudentExams();
        setExams(data.exams);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载考试列表失败");
      } finally {
        setLoading(false);
      }
    }

    loadExams();
  }, []);

  return (
    <section className="space-y-8">
      <PageIntro
        eyebrow="Exams"
        title="当前可参加的考试"
        description="这里展示已经发布给学生的考试。你可以进入考试、继续作答，并在提交后回到历史成绩查看结果。"
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
        <Card className="rounded-[30px] border-slate-200 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">考试中心</p>
              <p className="text-2xl font-semibold text-slate-950">{loading ? "-" : exams.length}</p>
              <p className="text-sm text-slate-600">当前已发布、可进入作答的考试数量</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border-slate-200 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <FileText className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">作答说明</p>
              <p className="text-base font-medium text-slate-900">进入考试后会自动创建或继续已有 submission</p>
              <p className="text-sm text-slate-600">保存答案后刷新页面，已保存内容会自动回填。</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? <LoadingState title="正在加载考试列表" description="考试数据正在同步，请稍候。" /> : null}
      {!loading && error ? <ErrorState description={error} /> : null}
      {!loading && !error && exams.length === 0 ? (
        <EmptyState title="暂无可参加的考试" description="管理员发布考试后，这里会显示新的考试安排。" />
      ) : null}

      {!loading && !error && exams.length > 0 ? (
        <div className="grid gap-5">
          {exams.map((exam) => (
            <Card
              key={exam.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/student/exams/${exam.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  router.push(`/student/exams/${exam.id}`);
                }
              }}
              className="cursor-pointer rounded-[30px] border-slate-200 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
            >
              <CardHeader className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-3xl space-y-4">
                    <Badge variant={statusVariant(exam.status)}>{exam.status}</Badge>
                    <CardTitle className="text-3xl tracking-tight text-slate-950">{exam.title}</CardTitle>
                    <CardDescription className="text-base leading-8 text-slate-600">
                      {exam.description || "暂无考试说明。"}
                    </CardDescription>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-blue-700" />
                      时长 {exam.duration_minutes} 分钟
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex justify-end pt-0">
                <Button
                  className="h-12 rounded-2xl px-5"
                  onClick={(event) => {
                    event.stopPropagation();
                    router.push(`/student/exams/${exam.id}`);
                  }}
                >
                  开始 / 继续考试
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}
