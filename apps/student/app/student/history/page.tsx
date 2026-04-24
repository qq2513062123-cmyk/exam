"use client";

import { useEffect, useState } from "react";
import { History, Trophy } from "lucide-react";

import PageIntro from "../../../components/PageIntro";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { EmptyState } from "../../../components/ui/empty-state";
import { ErrorState } from "../../../components/ui/error-state";
import { LoadingState } from "../../../components/ui/loading-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { getStudentHistory, HistoryItem } from "../../../lib/api";

function formatScore(value: number | null) {
  return value === null ? "待出分" : String(value);
}

function statusVariant(status: HistoryItem["status"]) {
  if (status === "graded") {
    return "success" as const;
  }

  if (status === "pending_review") {
    return "warning" as const;
  }

  if (status === "in_progress") {
    return "default" as const;
  }

  return "secondary" as const;
}

export default function StudentHistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      setError("");

      try {
        const data = await getStudentHistory();
        setItems(data.submissions);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载历史成绩失败");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  return (
    <section className="space-y-8">
      <PageIntro
        eyebrow="History"
        title="历史成绩与提交记录"
        description="查看自己的考试提交状态、客观题得分、主观题得分以及最终总分。简答题复核完成前会显示待出分。"
      />

      <div className="grid gap-4 xl:grid-cols-[1fr,1fr]">
        <Card className="rounded-[30px] border-slate-200 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <History className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">历史记录</p>
              <p className="text-2xl font-semibold text-slate-950">{loading ? "-" : items.length}</p>
              <p className="text-sm text-slate-600">你提交过的考试会按时间倒序显示在这里</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border-slate-200 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Trophy className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">成绩说明</p>
              <p className="text-base font-medium text-slate-900">主观题分数在人工复核完成前会显示为待出分</p>
              <p className="text-sm text-slate-600">这是正常状态，不影响后续查看最终成绩。</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? <LoadingState title="正在加载历史成绩" description="请稍候，我们正在整理你的考试记录。" /> : null}
      {!loading && error ? <ErrorState description={error} /> : null}
      {!loading && !error && items.length === 0 ? (
        <EmptyState title="暂无历史成绩" description="完成一次考试提交后，这里会自动出现你的记录。" />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <Card className="rounded-[30px] border-slate-200 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="h-5 w-5 text-amber-500" />
              我的考试记录
            </CardTitle>
            <CardDescription className="text-base leading-8 text-slate-600">
              提交记录会展示考试状态、总分、客观题分和主观题分，便于你快速回看整个考试过程。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>考试</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>总分</TableHead>
                  <TableHead>客观题</TableHead>
                  <TableHead>主观题</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-slate-950">{item.exam.title}</p>
                        <p className="text-xs text-slate-500">{item.exam.description || "暂无考试说明"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                    </TableCell>
                    <TableCell>{formatScore(item.total_score)}</TableCell>
                    <TableCell>{formatScore(item.objective_score)}</TableCell>
                    <TableCell>{formatScore(item.subjective_score)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
