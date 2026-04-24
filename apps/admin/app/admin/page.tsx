"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, ClipboardList, FileQuestion, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

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
      description: "维护单选题、判断题和简答题，控制题库质量与可用性。",
      href: "/admin/questions"
    },
    {
      title: "考试管理",
      description: "创建考试、设置状态、绑定题目，快速组织正式考试。",
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

      <Card className="overflow-hidden rounded-[40px] border-slate-200 bg-[#0b1220] text-white shadow-[0_28px_70px_rgba(15,23,42,0.18)]">
        <CardContent className="grid gap-8 p-8 lg:grid-cols-[1.1fr,0.9fr] lg:p-10">
          <div className="space-y-5">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium text-slate-200">
              管理视角 / 全链路工作台
            </span>

            <div className="space-y-4">
              <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
                把题库、考试、提交与统计
                <br />
                收在一个更清楚的后台里
              </h2>
              <p className="max-w-2xl text-sm leading-8 text-slate-300 md:text-base">
                后台的重点不是堆功能，而是让你更快找到关键状态。这里保留了最常用的工作流：
                建题、建卷、复核与统计。
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">题库与考试统一维护</div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">简答题复核集中处理</div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">统计状态一屏查看</div>
            </div>

            <Button asChild className="h-12 rounded-2xl bg-white px-5 text-slate-950 hover:bg-slate-100">
              <Link href="/admin/questions">
                进入题库管理
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {statItems.map((item) => (
              <div key={item.label} className="rounded-[28px] border border-white/10 bg-white/6 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-300">{item.label}</p>
                    <p className="mt-3 text-4xl font-semibold text-white">{item.value}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3 text-blue-200">
                    <item.icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {quickLinks.map((item) => (
          <Card key={item.title} className="rounded-[32px] border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl tracking-tight text-slate-950">{item.title}</CardTitle>
              <p className="text-sm leading-7 text-slate-600">{item.description}</p>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="rounded-2xl">
                <Link href={item.href}>
                  进入模块
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
