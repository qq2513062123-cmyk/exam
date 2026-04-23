"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getStoredUser, getToken } from "../lib/auth";
import { LoadingState } from "./ui/loading-state";

type RouteGuardProps = {
  children: React.ReactNode;
};

export default function RouteGuard({ children }: RouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(false);

    const token = getToken();
    const user = getStoredUser();

    if (!token || !user || user.role !== "student") {
      router.replace("/login");
      return;
    }

    setAllowed(true);
  }, [pathname, router]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-2xl py-16">
        <LoadingState title="正在检查登录状态" description="请稍候，我们正在确认当前访问权限。" />
      </div>
    );
  }

  return <>{children}</>;
}
