"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, CalendarRange, ClipboardList, FileQuestion, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import PageIntro from "../../components/PageIntro";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { AdminStats, getAdminScores } from "../../lib/api";

export default function AdminHomePage() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    getAdminScores()
      .then((data) => setStats(data.stats))
      .catch(() => setStats(null));
  }, []);

  const statItems = [
    {
      label: "已发布考试",
      value: stats?.published_exam_count ?? "-",
      description: "当前对学生开放的考试数量",
      icon: CalendarRange
    },
    {
      label: "总提交数",
      value: stats?.submission_count ?? "-",
      description: "包含待复核与已完成记录",
      icon: ClipboardList
    },
    {
      label: "待复核",
      value: stats?.pending_review_count ?? "-",
      description: "需要人工处理的简答题提交",
      icon: ShieldCheck
    },
    {
      label: "参与学生数",
      value: stats?.unique_student_count ?? "-",
      description: "已有提交记录的学生数量",
      icon: BarChart3
    }
  ];

  const quickLinks = [
    {
      title: "题库管理",
      description: "维护题干、答案和分值，让内容质量和可用性保持稳定。",
      href: "/admin/questions",
      icon: FileQuestion
    },
    {
      title: "考试管理",
      description: "创建考试、调整状态、绑定题目，快速组织正式考试。",
      href: "/admin/exams",
      icon: CalendarRange
    },
    {
      title: "提交与复核",
      description: "集中查看学生提交并完成简答题人工复核。",
      href: "/admin/submissions",
      icon: ClipboardList
    }
  ];

  return (
    <section className="space-y-8">
      <PageIntro
        eyebrow="Dashboard"
        title="后台管理概览"
        description="这里先展示最关键的状态，再把你带到题库、考试、提交复核和统计分析。结构参考学生端，但信息密度更适合管理操作。"
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
        <Card className="rounded-[32px] border-0 bg-[#0b1220] text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-[1.05fr,0.95fr]">
            <div className="space-y-5">
              <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium text-blue-100">
                Management Workspace
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
                  把题库、考试、复核和统计，
                  <br />
                  收在一个更清楚的后台里。
                </h2>
                <p className="max-w-2xl text-sm leading-8 text-slate-300 md:text-base">
                  后台不该让你一眼看不清重点。我们把最常用的管理动作和最需要盯住的状态放在首页前半屏，让你先判断当前情况，再进入具体模块。
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">题库维护更集中</div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">复核状态更清楚</div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">统计入口更直接</div>
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
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-300">{item.label}</p>
                      <p className="mt-3 text-4xl font-semibold text-white">{item.value}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-3 text-blue-200">
                      <item.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-4 text-xs leading-6 text-slate-400">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-slate-200 bg-white/92 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardContent className="space-y-4 p-6">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              今日优先项
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold tracking-tight text-slate-950">先看这三件事</h3>
              <p className="text-sm leading-7 text-slate-600">
                当你进入后台首页时，先确认待复核、已发布考试和整体提交情况，工作流会顺很多。
              </p>
            </div>

            {[
              "先看有没有新的待复核记录需要处理。",
              "确认最近考试是否已经发布并绑定题目。",
              "去统计分析看平均分和参与情况是否异常。"
            ].map((item, index) => (
              <div key={item} className="flex gap-4 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-slate-700">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {quickLinks.map((item) => (
          <Card
            key={item.title}
            className="rounded-[30px] border-slate-200 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
          >
            <CardContent className="p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <item.icon className="h-6 w-6" />
              </div>

              <div className="mt-6 space-y-3">
                <h3 className="text-2xl font-semibold tracking-tight text-slate-950">{item.title}</h3>
                <p className="text-sm leading-7 text-slate-600">{item.description}</p>
              </div>

              <Button asChild variant="outline" className="mt-6 h-11 rounded-2xl">
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
