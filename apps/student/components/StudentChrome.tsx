"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpenCheck, History, LayoutGrid, LogOut } from "lucide-react";

import { Button } from "./ui/button";
import { clearAuth, getStoredUser } from "../lib/auth";

const navItems = [
  { href: "/student/exams", label: "考试列表", icon: LayoutGrid },
  { href: "/student/history", label: "历史成绩", icon: History }
];

export default function StudentChrome({
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_28%,#f8fafc_58%,#f8fafc_100%)]">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/student/exams" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                <BookOpenCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Student App</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">在线考试学生端</p>
              </div>
            </Link>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
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

          <div className="flex items-center gap-3">
            <div className="hidden rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-right md:block">
              <p className="text-sm font-medium text-slate-900">{user?.name || user?.email || "学生用户"}</p>
              <p className="text-xs text-slate-500">student</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              退出
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
