import { AlertTriangle } from "lucide-react";

import { cn } from "../../lib/utils";
import { Card, CardContent } from "./card";

export function ErrorState({
  title = "加载失败",
  description,
  className
}: {
  title?: string;
  description: string;
  className?: string;
}) {
  return (
    <Card className={cn("rounded-2xl border-red-200 bg-red-50", className)}>
      <CardContent className="flex items-start gap-3 px-6 py-6">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-red-700">{title}</p>
          <p className="text-sm text-red-600">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
