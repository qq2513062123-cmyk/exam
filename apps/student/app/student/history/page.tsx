"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

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

      {loading ? <LoadingState title="正在加载历史成绩" description="请稍候，我们正在整理你的考试记录。" /> : null}
      {!loading && error ? <ErrorState description={error} /> : null}
      {!loading && !error && items.length === 0 ? (
        <EmptyState title="暂无历史成绩" description="完成一次考试提交后，这里会自动出现你的记录。" />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="h-5 w-5 text-amber-500" />
              我的考试记录
            </CardTitle>
            <CardDescription className="text-sm leading-7">
              主观题分数在人工复核完成前会显示为待出分，这是正常状态。
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
