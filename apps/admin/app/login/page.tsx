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
    <section className="min-h-screen bg-[#f3f5f7] px-6 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="rounded-[32px] bg-slate-950 p-8 text-white md:p-10">
          <div className="flex h-full flex-col justify-between gap-10">
            <div className="space-y-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-blue-200">Admin Console</p>
                <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                  在线考试管理后台
                </h1>
                <p className="max-w-xl text-sm leading-7 text-slate-300 md:text-base">
                  统一管理题库、考试、提交记录、人工复核与统计分析，让整个考试组织流程更可控。
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-300">管理维度</p>
                <p className="mt-2 text-lg font-semibold text-white">从题库到统计</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">覆盖考试管理完整生命周期，不需要切换多个入口。</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-300">复核能力</p>
                <p className="mt-2 text-lg font-semibold text-white">人工评分补充</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">简答题进入待复核，支持人工评分后自动更新总分。</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <Card className="w-full rounded-[32px] border-slate-200 bg-white shadow-sm">
            <CardHeader className="space-y-3">
              <CardTitle className="text-3xl text-slate-950">管理员登录</CardTitle>
              <CardDescription className="text-base leading-7">
                使用管理员账号进入后台，管理考试、查看提交记录并完成复核。
              </CardDescription>
            </CardHeader>
            <CardContent>
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

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "登录中..." : "进入管理后台"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
