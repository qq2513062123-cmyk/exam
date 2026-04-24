"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Alert } from "../../components/ui/alert";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { loginAdmin, saveAuth } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { token, user } = await loginAdmin(email, password);

      if (user.role !== "admin") {
        setError("当前账号不是管理员角色，不能进入管理后台。");
        return;
      }

      saveAuth(token, user);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_48%,#eef2ff_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto grid max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="rounded-[32px] border border-slate-200 bg-[#060b1f] p-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.20)] md:p-10">
          <div className="flex min-h-[540px] flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">Admin Console</p>
                <h1 className="max-w-lg text-4xl font-semibold leading-tight md:text-5xl">在线考试管理后台</h1>
                <p className="max-w-lg text-sm leading-7 text-slate-300 md:text-base">
                  统一管理题库、考试、提交记录、人工复核与统计分析，保持整套系统运行清晰可控。
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-300">题库与考试</p>
                <p className="mt-2 text-xl font-semibold text-white">集中维护</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">在同一后台里完成出题、建卷、发布和更新。</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-300">评分与统计</p>
                <p className="mt-2 text-xl font-semibold text-white">复核闭环</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">简答题人工复核与统计面板集中呈现，不再分散跳转。</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.10)] md:p-10">
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold text-slate-950">管理员登录</h2>
              <p className="text-base leading-7 text-slate-600">使用管理员账号进入后台，管理考试、查看提交记录并完成复核。</p>
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
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-base font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{loading ? "登录中..." : "进入管理后台"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              默认管理员账号已预填，可直接验证后台链路。
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
