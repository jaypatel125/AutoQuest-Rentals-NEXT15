import { cn } from "@/lib/utils";
import { greenScore } from "@/lib/green";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const pill =
  "inline-flex items-center gap-1.5 rounded-full border bg-background px-2 py-0.5 text-xs font-medium whitespace-nowrap";

const dot = "size-1.5 shrink-0 rounded-full bg-current";

/** A-to-E rating from tailpipe emissions (g/km). */
export function GreenScoreBadge({
  emissions,
  className,
  showLabel = false,
}: {
  emissions: number | string | null | undefined;
  className?: string;
  showLabel?: boolean;
}) {
  const score = greenScore(emissions);
  const clean = score.grade === "A+" || score.grade === "A";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            pill,
            clean ? "text-eco" : "text-muted-foreground",
            className
          )}
        >
          <span>Green {score.grade}</span>
          {showLabel && (
            <span className="text-muted-foreground">· {score.label}</span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        Green Score {score.grade}: {score.label} ({Number(emissions ?? 0)} g
        CO₂/km)
      </TooltipContent>
    </Tooltip>
  );
}

export function FuelBadge({
  fuelType,
  className,
}: {
  fuelType?: string | null;
  className?: string;
}) {
  const type = fuelType ?? "Petrol";
  return (
    <span
      className={cn(
        pill,
        type === "Electric" ? "text-eco" : "text-muted-foreground",
        className
      )}
    >
      {type === "Electric" && <span className={dot} aria-hidden />}
      {type}
    </span>
  );
}

const STATUS: Record<string, string> = {
  Confirmed: "text-foreground [&>span:first-child]:text-eco",
  Pending: "text-foreground [&>span:first-child]:text-warning",
  Completed: "text-muted-foreground",
  Cancelled: "text-destructive",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span className={cn(pill, STATUS[status] ?? STATUS.Pending, className)}>
      <span className={dot} aria-hidden />
      {status}
    </span>
  );
}
