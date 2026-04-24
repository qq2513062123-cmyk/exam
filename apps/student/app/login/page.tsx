"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpenCheck } from "lucide-react";

import { Alert } from "../../components/ui/alert";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { loginStudent, saveAuth } from "../../lib/auth";

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
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_46%,#eef2ff_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-6 lg:grid-cols-[1.02fr,0.98fr]">
        <div className="rounded-[32px] border border-slate-200 bg-[#060b1f] p-8 text-white shadow-[0_32px_80px_rgba(15,23,42,0.18)] md:p-10">
          <div className="flex min-h-[560px] flex-col justify-between gap-10">
            <div className="space-y-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <BookOpenCheck className="h-6 w-6" />
              </div>

              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">Student App</p>
                <h1 className="max-w-lg text-4xl font-semibold leading-tight md:text-5xl">在线考试学生端</h1>
                <p className="max-w-lg text-base leading-8 text-slate-300">
                  进入考试列表、保存答案、刷新回填，并在交卷后查看自己的历史成绩。
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-300">保存并继续</p>
                <p className="mt-2 text-2xl font-semibold text-white">断点续答</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  已保存的答案会在刷新后自动回填，减少重复操作。
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-300">成绩追踪</p>
                <p className="mt-2 text-2xl font-semibold text-white">提交后可查</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  历史成绩页会展示总分、客观题分和主观题状态。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.10)] md:p-10">
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold text-slate-950">学生登录</h2>
              <p className="text-base leading-7 text-slate-600">
                使用学生账号进入考试系统，开始作答并查看历史成绩。
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              {error ? <Alert>{error}</Alert> : null}

              <button
                type="submit"
                disabled={loading}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{loading ? "登录中..." : "进入学生端"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              默认测试账号已预填，可直接验证登录链路。
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
