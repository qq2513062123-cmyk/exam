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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_26%,#f8fafc_58%,#f8fafc_100%)] lg:grid lg:grid-cols-[292px,1fr]">
      <aside className="border-b border-slate-200/70 bg-white/90 backdrop-blur lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="border-b border-slate-200/70 px-6 py-6">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
              <BookOpenCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Admin Console</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">在线考试管理后台</p>
            </div>
          </Link>
        </div>

        <div className="px-4 py-5">
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">导航</p>
          <nav className="mt-3 flex gap-2 overflow-x-auto lg:block lg:space-y-2 lg:overflow-visible">
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 whitespace-nowrap rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-white hover:text-slate-950"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/82 backdrop-blur">
          <div className="mx-auto flex max-w-[1520px] items-center justify-between gap-4 px-6 py-4 xl:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Management Workspace</p>
              <p className="mt-1 text-sm text-slate-500">
                统一查看题库、考试、提交记录与统计，后台状态更清晰。
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-2xl border border-slate-200 bg-white/85 px-4 py-2 text-right md:block">
                <p className="text-sm font-medium text-slate-900">{user?.name || user?.email || "管理员"}</p>
                <p className="text-xs text-slate-500">admin</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                退出
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1520px] px-6 py-8 xl:px-8">{children}</main>
      </div>
    </div>
  );
}
