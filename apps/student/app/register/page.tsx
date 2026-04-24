"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpenCheck, ShieldCheck, UserPlus } from "lucide-react";

import { Alert } from "../../components/ui/alert";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { registerStudent, saveAuth } from "../../lib/auth";

const features = [
  {
    icon: UserPlus,
    title: "学生自助注册",
    description: "外部用户可以自行创建学生账号，并在注册后直接进入考试列表。"
  },
  {
    icon: ShieldCheck,
    title: "角色固定为 student",
    description: "注册接口不允许传 role，后端会强制按 student 创建账号。"
  }
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致。");
      return;
    }

    setLoading(true);

    try {
      const { token, user } = await registerStudent(name, email, password);
      saveAuth(token, user);
      router.push("/student/exams");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_30%,#f8fafc_60%,#f8fafc_100%)] px-4 py-6 sm:px-6 lg:px-8">
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
                  新用户可直接注册并进入考试系统
                </span>
                <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
                  创建学生账号，
                  <br />
                  然后直接开始考试。
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                  这里只提供学生自助注册。注册成功后会自动登录，并跳转到考试列表页面，不需要再重复填写登录信息。
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {features.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                      <Icon className="h-5 w-5 text-blue-200" />
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
                学生账号注册
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-semibold tracking-tight text-slate-950">创建新账号</h2>
                <p className="text-base leading-7 text-slate-600">
                  填写姓名、邮箱和密码，注册成功后会自动进入学生考试列表。
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/70 px-4 text-base focus:bg-white"
                />
              </div>

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
                  minLength={8}
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/70 px-4 text-base focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={8}
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/70 px-4 text-base focus:bg-white"
                />
              </div>

              {error ? <Alert>{error}</Alert> : null}

              <button
                type="submit"
                disabled={loading}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-base font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{loading ? "注册中..." : "创建学生账号"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-5 text-sm text-slate-600">
              已有账号？
              <Link href="/login" className="ml-2 font-medium text-slate-950 underline-offset-4 hover:underline">
                去登录
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
