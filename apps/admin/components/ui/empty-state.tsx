import { Inbox } from "lucide-react";

import { cn } from "../../lib/utils";
import { Card, CardContent } from "./card";

export function EmptyState({
  title,
  description,
  className
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <Card className={cn("rounded-2xl border-dashed", className)}>
      <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <div className="rounded-full bg-gray-100 p-3 text-gray-500">
          <Inbox className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
