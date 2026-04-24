"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpenCheck,
  CalendarRange,
  ClipboardList,
  FileQuestion,
  LayoutPanelTop,
  LogOut
} from "lucide-react";

import { clearAuth, getStoredUser } from "../lib/auth";
import { Button } from "./ui/button";

const navItems = [
  { href: "/admin", label: "概览", icon: LayoutPanelTop },
  { href: "/admin/questions", label: "题库管理", icon: FileQuestion },
  { href: "/admin/exams", label: "考试管理", icon: CalendarRange },
  { href: "/admin/submissions", label: "提交记录", icon: ClipboardList },
  { href: "/admin/scores", label: "统计分析", icon: BarChart3 }
];

export default function AdminChrome({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser();

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb] lg:grid lg:grid-cols-[284px,1fr]">
      <aside className="border-b border-slate-800 bg-[#0b1220] text-white lg:min-h-screen lg:border-b-0 lg:border-r lg:border-slate-800/80">
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-6 py-6">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white shadow-inner shadow-white/10">
                <BookOpenCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">Admin Console</p>
                <p className="mt-1 text-lg font-semibold text-white">在线考试管理后台</p>
              </div>
            </Link>
          </div>

          <div className="px-4 py-5">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">工作区</p>
            <nav className="mt-3 flex gap-2 overflow-x-auto lg:block lg:space-y-2 lg:overflow-visible">
              {navItems.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 whitespace-nowrap rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-white text-slate-950 shadow-[0_12px_30px_rgba(15,23,42,0.24)]"
                        : "text-slate-300 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto border-t border-white/10 px-4 py-5">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-white">{user?.name || user?.email || "管理员"}</p>
              <p className="mt-1 text-xs text-slate-400">admin</p>
              <Button variant="outline" onClick={handleLogout} className="mt-4 w-full border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <LogOut className="h-4 w-4" />
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-slate-200/80 bg-white/88 backdrop-blur">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-6 py-5 xl:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Management Workspace</p>
              <p className="mt-1 text-sm text-slate-500">统一查看题库、考试、提交记录与统计，后台状态更清晰。</p>
            </div>

            <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-right md:block">
              <p className="text-sm font-medium text-slate-900">{user?.name || user?.email || "管理员"}</p>
              <p className="text-xs text-slate-500">已连接工作区</p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-6 py-8 xl:px-8">{children}</main>
      </div>
    </div>
  );
}
