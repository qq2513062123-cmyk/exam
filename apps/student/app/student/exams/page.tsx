"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock3 } from "lucide-react";

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

      {loading ? <LoadingState title="正在加载考试列表" description="考试数据正在同步，请稍候。" /> : null}
      {!loading && error ? <ErrorState description={error} /> : null}
      {!loading && !error && exams.length === 0 ? (
        <EmptyState title="暂无可参加的考试" description="管理员发布考试后，这里会显示新的考试安排。" />
      ) : null}

      {!loading && !error && exams.length > 0 ? (
        <div className="grid gap-5">
          {exams.map((exam) => (
            <Card key={exam.id} className="rounded-[28px] border-slate-200 bg-white shadow-sm">
              <CardHeader className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <Badge variant={statusVariant(exam.status)}>{exam.status}</Badge>
                    <CardTitle className="text-2xl">{exam.title}</CardTitle>
                    <CardDescription className="max-w-3xl text-sm leading-7">
                      {exam.description || "暂无考试说明。"}
                    </CardDescription>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-blue-700" />
                      时长 {exam.duration_minutes} 分钟
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex justify-end pt-0">
                <Button onClick={() => router.push(`/student/exams/${exam.id}`)}>
                  进入考试
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
