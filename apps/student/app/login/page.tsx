"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpenCheck, CheckCircle2, Clock3, FileText } from "lucide-react";

import { Alert } from "../../components/ui/alert";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { loginStudent, saveAuth } from "../../lib/auth";

const highlights = [
  {
    icon: Clock3,
    label: "保存并继续",
    title: "断点续答",
    description: "已保存的答案会在刷新后自动回填，减少重复操作。"
  },
  {
    icon: FileText,
    label: "提交后查看",
    title: "成绩可追踪",
    description: "历史成绩页会展示总分、客观题分和主观题状态。"
  }
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("student@example.com");
  const [password, setPassword] = useState("Student123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { token, user } = await loginStudent(email, password);

      if (user.role !== "student") {
        setError("当前账号不是学生角色，不能进入学生端。");
        return;
      }

      saveAuth(token, user);
      router.push("/student/exams");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_28%,#f8fafc_58%,#f8fafc_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-center gap-6 lg:grid-cols-[1.08fr,0.92fr]">
        <section className="relative overflow-hidden rounded-[36px] border border-slate-200/80 bg-[#060b1f] px-8 py-9 text-white shadow-[0_35px_90px_rgba(15,23,42,0.22)] sm:px-10 sm:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.16),transparent_30%)]" />
          <div className="relative flex min-h-[620px] flex-col justify-between gap-10">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-inner shadow-white/5">
                  <BookOpenCheck className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200/90">Student App</p>
                  <p className="mt-2 text-sm text-slate-300">在线考试学生端</p>
                </div>
              </div>

              <div className="max-w-xl space-y-5">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-medium text-slate-200">
                  作答、保存、提交与历史成绩统一在同一入口完成
                </span>
                <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
                  更专注的考试体验，
                  <br />
                  更清楚的作答流程。
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                  进入考试列表、保存答案、刷新回填，并在交卷后查看自己的历史成绩。界面保持克制，重点只留给真正需要的操作。
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">考试列表清晰可读</div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">已保存答案自动回显</div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">提交后成绩状态可追踪</div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                        <Icon className="h-5 w-5 text-blue-200" />
                      </div>
                      <span className="text-sm text-slate-300">{item.label}</span>
                    </div>
                    <h2 className="mt-5 text-2xl font-semibold text-white">{item.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-[520px] rounded-[32px] border border-slate-200 bg-white/95 p-8 shadow-[0_28px_70px_rgba(15,23,42,0.12)] backdrop-blur sm:p-9">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                学生账号登录
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-semibold tracking-tight text-slate-950">欢迎回来</h2>
                <p className="text-base leading-7 text-slate-600">
                  使用学生账号进入考试系统，继续作答、提交试卷并查看历史成绩。
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/70 px-4 text-base focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/70 px-4 text-base focus:bg-white"
                />
              </div>

              {error ? <Alert>{error}</Alert> : null}

              <button
                type="submit"
                disabled={loading}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-base font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{loading ? "登录中..." : "进入学生端"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-900">测试账号已预填</p>
                  <p className="text-sm leading-6 text-slate-600">你可以直接点击登录，验证线上作答链路是否通畅。</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
