"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BarChart3, ClipboardList, FileQuestion, ShieldCheck } from "lucide-react";
import Link from "next/link";

import PageIntro from "../../components/PageIntro";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { AdminStats, getAdminScores } from "../../lib/api";

export default function AdminHomePage() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    getAdminScores()
      .then((data) => setStats(data.stats))
      .catch(() => setStats(null));
  }, []);

  const statItems = [
    { label: "已发布考试", value: stats?.published_exam_count ?? "-", icon: BarChart3 },
    { label: "总提交数", value: stats?.submission_count ?? "-", icon: ClipboardList },
    { label: "待复核", value: stats?.pending_review_count ?? "-", icon: ShieldCheck },
    { label: "参与学生数", value: stats?.unique_student_count ?? "-", icon: FileQuestion }
  ];

  const quickLinks = [
    {
      title: "题库管理",
      description: "维护单选、判断与简答题，控制题库质量与可用性。",
      href: "/admin/questions"
    },
    {
      title: "考试管理",
      description: "创建考试、设定状态、绑定题目，快速组织正式考试。",
      href: "/admin/exams"
    },
    {
      title: "提交与复核",
      description: "查看学生提交情况，完成简答题人工评分与最终复核。",
      href: "/admin/submissions"
    }
  ];

  return (
    <section className="space-y-8">
      <PageIntro
        eyebrow="Dashboard"
        title="后台管理概览"
        description="从这里快速查看系统当前状态，进入题库、考试、提交记录和统计模块。"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statItems.map((item) => (
          <Card key={item.label} className="rounded-[30px] border-slate-200 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
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

      <Card className="rounded-[32px] border-slate-200 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.2fr,0.8fr] lg:p-8">
          <div className="space-y-4">
            <p className="text-sm font-medium text-blue-700">管理视角</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">把题库、考试、提交和统计收在一套后台里</h2>
            <p className="max-w-2xl text-sm leading-8 text-slate-600">
              后台的重点不是堆功能，而是让你更快找到关键状态。这里保留了最常用的工作流：建题、建卷、复核与统计。
            </p>
          </div>

          <div className="flex items-start lg:justify-end">
            <Button asChild className="h-12 rounded-2xl px-5">
              <Link href="/admin/questions">
                进入题库管理
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {quickLinks.map((item) => (
          <Card key={item.title} className="rounded-[30px] border-slate-200 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl tracking-tight">{item.title}</CardTitle>
              <p className="text-sm leading-7 text-slate-600">{item.description}</p>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="rounded-2xl">
                <Link href={item.href}>进入模块</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
