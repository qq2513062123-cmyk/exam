"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpenCheck } from "lucide-react";

import { Alert } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
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
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_42%,#eef2ff_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:min-h-[calc(100vh-64px)] lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] md:p-10">
          <div className="flex h-full min-h-[320px] flex-col justify-between gap-8 lg:min-h-[560px]">
            <div className="space-y-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <BookOpenCheck className="h-6 w-6" />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-blue-200">Student App</p>
                <h1 className="max-w-xl text-4xl font-semibold leading-tight md:text-5xl">在线考试学生端</h1>
                <p className="max-w-lg text-sm leading-7 text-slate-300 md:text-base">
                  专注于考试参与体验，支持考试列表、答案保存、刷新回填、正式提交与历史成绩查看。
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-sm text-slate-300">作答体验</p>
                <p className="mt-2 text-lg font-semibold text-white">保存并继续</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">支持整卷保存，刷新后继续上次作答状态。</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-sm text-slate-300">结果反馈</p>
                <p className="mt-2 text-lg font-semibold text-white">成绩可追踪</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">提交后可在历史成绩中查看状态与得分。</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Card className="w-full max-w-xl rounded-[32px] border-slate-200/80 bg-white/90 shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur">
            <CardHeader className="space-y-3 pb-4">
              <CardTitle className="text-3xl text-slate-950">学生登录</CardTitle>
              <CardDescription className="text-base leading-7">
                使用学生账号进入考试系统，开始作答并查看历史成绩。
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
                  {loading ? "登录中..." : "进入学生端"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                默认测试账号已预填，可直接验证登录链路。
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
