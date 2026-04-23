import { LoaderCircle } from "lucide-react";

import { cn } from "../../lib/utils";
import { Card, CardContent } from "./card";

export function LoadingState({
  title = "正在加载",
  description = "请稍候，数据正在准备中。",
  className
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <Card className={cn("rounded-2xl", className)}>
      <CardContent className="flex items-center gap-3 px-6 py-8">
        <LoaderCircle className="h-5 w-5 animate-spin text-blue-600" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
