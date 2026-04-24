"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Alert } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
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
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_42%,#eef2ff_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:min-h-[calc(100vh-64px)] lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] md:p-10">
          <div className="flex h-full min-h-[320px] flex-col justify-between gap-8 lg:min-h-[560px]">
            <div className="space-y-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-blue-200">Admin Console</p>
                <h1 className="max-w-xl text-4xl font-semibold leading-tight md:text-5xl">在线考试管理后台</h1>
                <p className="max-w-lg text-sm leading-7 text-slate-300 md:text-base">
                  统一管理题库、考试、提交记录、人工复核与统计分析，让整个考试组织流程更可控。
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-sm text-slate-300">管理维度</p>
                <p className="mt-2 text-lg font-semibold text-white">从题库到统计</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">覆盖考试管理完整生命周期，不需要切换多个入口。</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-sm text-slate-300">复核能力</p>
                <p className="mt-2 text-lg font-semibold text-white">人工评分补充</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">简答题进入待复核，支持人工评分后自动更新总分。</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Card className="w-full max-w-xl rounded-[32px] border-slate-200/80 bg-white/90 shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur">
            <CardHeader className="space-y-3 pb-4">
              <CardTitle className="text-3xl text-slate-950">管理员登录</CardTitle>
              <CardDescription className="text-base leading-7">
                使用管理员账号进入后台，管理考试、查看提交记录并完成复核。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
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

                <Button type="submit" className="h-12 w-full rounded-2xl text-base" size="lg" disabled={loading}>
                  {loading ? "登录中..." : "进入管理后台"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                默认管理员账号已预填，可直接验证后台链路。
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
