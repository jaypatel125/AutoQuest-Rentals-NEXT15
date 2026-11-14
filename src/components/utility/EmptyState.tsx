import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed bg-card/60 px-6 py-16 text-center",
        className
      )}
    >
      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Icon className="size-7" />
      </span>
      <div className="max-w-sm space-y-1.5">
        <h3 className="font-display text-lg font-bold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
