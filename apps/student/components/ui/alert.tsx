import * as React from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import { cn } from "../../lib/utils";

type Tone = "danger" | "success" | "info";

const toneMap: Record<Tone, string> = {
  danger: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  info: "border-blue-200 bg-blue-50 text-blue-700"
};

const iconMap = {
  danger: AlertCircle,
  success: CheckCircle2,
  info: Info
};

export function Alert({
  children,
  tone = "danger",
  className
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const Icon = iconMap[tone];

  return (
    <div className={cn("flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm", toneMap[tone], className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
