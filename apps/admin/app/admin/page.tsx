"use client";

import { useEffect, useState } from "react";
import { BarChart3, ClipboardList, FileQuestion, ShieldCheck } from "lucide-react";

import PageIntro from "../../components/PageIntro";
import { Card, CardContent } from "../../components/ui/card";
import { AdminStats, getAdminScores } from "../../lib/api";

export default function AdminHomePage() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    getAdminScores()
      .then((data) => setStats(data.stats))
      .catch(() => setStats(null));
  }, []);

  return (
    <section className="space-y-8">
      <PageIntro
        eyebrow="Dashboard"
        title="后台管理概览"
        description="从这里快速了解考试系统当前状态，并进入题库、考试、提交记录和统计模块。"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "已发布考试", value: stats?.published_exam_count ?? "-", icon: BarChart3 },
          { label: "总提交数", value: stats?.submission_count ?? "-", icon: ClipboardList },
          { label: "待复核", value: stats?.pending_review_count ?? "-", icon: ShieldCheck },
          { label: "参加学生数", value: stats?.unique_student_count ?? "-", icon: FileQuestion }
        ].map((item) => (
          <Card key={item.label} className="rounded-[28px] border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-start justify-between p-6">
              <div className="space-y-2">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="text-3xl font-semibold text-slate-950">{item.value}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 text-blue-700">
                <item.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          {
            title: "题库管理",
            description: "维护题目内容，覆盖单选、判断和简答三类题型。"
          },
          {
            title: "考试管理",
            description: "创建考试、设置状态、绑定题目，控制考试内容与发布节奏。"
          },
          {
            title: "提交与复核",
            description: "查看学生提交情况，对简答题进行人工评分并更新最终成绩。"
          }
        ].map((item) => (
          <Card key={item.title} className="rounded-[28px] border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-3 p-6">
              <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
              <p className="text-sm leading-7 text-slate-600">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
