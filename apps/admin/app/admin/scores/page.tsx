"use client";

import { useEffect, useState } from "react";
import { BarChart3, CircleAlert } from "lucide-react";

import PageIntro from "../../../components/PageIntro";
import { Alert } from "../../../components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { EmptyState } from "../../../components/ui/empty-state";
import { ErrorState } from "../../../components/ui/error-state";
import { LoadingState } from "../../../components/ui/loading-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { AdminStats, getAdminScores } from "../../../lib/api";

export default function AdminScoresPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAdminScores();
        setStats(data.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载统计失败");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <section className="space-y-8">
      <PageIntro
        eyebrow="Scores & Overview"
        title="成绩统计"
        description="查看考试发布、提交、复核与成绩表现，用统一视图快速了解系统运行情况。"
      />

      {loading ? <LoadingState title="正在加载统计数据" description="核心指标与错题率数据正在同步。" /> : null}
      {!loading && error ? <ErrorState description={error} /> : null}

      {stats ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              { label: "已发布考试", value: stats.published_exam_count },
              { label: "总提交数", value: stats.submission_count },
              { label: "参加学生数", value: stats.unique_student_count },
              { label: "待复核", value: stats.pending_review_count },
              { label: "平均分", value: stats.average_score },
              { label: "通过率", value: `${(stats.pass_rate * 100).toFixed(2)}%` }
            ].map((item) => (
              <Card key={item.label} className="rounded-[28px] border-slate-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <CircleAlert className="h-5 w-5 text-amber-500" />
                客观题错误率 Top 10
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.question_wrong_rate_top10.length === 0 ? (
                <EmptyState title="暂无客观题作答数据" description="当学生提交包含客观题的试卷后，这里会出现统计结果。" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>题目</TableHead>
                      <TableHead>错误次数</TableHead>
                      <TableHead>作答次数</TableHead>
                      <TableHead>错误率</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.question_wrong_rate_top10.map((item) => (
                      <TableRow key={item.question_id}>
                        <TableCell>{item.stem}</TableCell>
                        <TableCell>{item.wrong_count}</TableCell>
                        <TableCell>{item.total_answered_count}</TableCell>
                        <TableCell>{(item.wrong_rate * 100).toFixed(2)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </section>
  );
}
