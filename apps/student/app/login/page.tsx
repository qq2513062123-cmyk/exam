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
    <section className="min-h-screen bg-[#f3f5f7] px-6 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="rounded-[32px] bg-slate-950 p-8 text-white md:p-10">
          <div className="flex h-full flex-col justify-between gap-10">
            <div className="space-y-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <BookOpenCheck className="h-6 w-6" />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-blue-200">Student App</p>
                <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                  在线考试学生端
                </h1>
                <p className="max-w-xl text-sm leading-7 text-slate-300 md:text-base">
                  专注于考试参与体验，支持考试列表、答案保存、刷新回填、正式提交与历史成绩查看。
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-300">作答体验</p>
                <p className="mt-2 text-lg font-semibold text-white">保存并继续</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">支持整卷保存，刷新后继续上次作答状态。</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-300">结果反馈</p>
                <p className="mt-2 text-lg font-semibold text-white">成绩可追踪</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">提交后可在历史成绩中查看状态与得分。</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <Card className="w-full rounded-[32px] border-slate-200 bg-white shadow-sm">
            <CardHeader className="space-y-3">
              <CardTitle className="text-3xl text-slate-950">学生登录</CardTitle>
              <CardDescription className="text-base leading-7">
                使用学生账号进入考试系统，开始作答并查看历史成绩。
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
                  {loading ? "登录中..." : "进入学生端"}
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
