import { Fuel, Leaf, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { greenScore, type GreenGrade } from "@/lib/green";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const pill =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ring-1 ring-inset";

const GRADE_TONES: Record<GreenGrade, string> = {
  "A+": "bg-eco-soft text-eco ring-eco/20",
  A: "bg-eco-soft text-eco ring-eco/20",
  B: "bg-accent text-accent-foreground ring-primary/15",
  C: "bg-amber-soft text-amber-800 ring-amber/30 dark:text-amber-200",
  D: "bg-orange-500/12 text-orange-700 ring-orange-500/25 dark:text-orange-300",
  E: "bg-destructive/10 text-destructive ring-destructive/20",
};

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
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn(pill, GRADE_TONES[score.grade], className)}>
          <Leaf className="size-3.5" aria-hidden />
          <span>Green {score.grade}</span>
          {showLabel && (
            <span className="font-medium opacity-80">· {score.label}</span>
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
  const style =
    type === "Electric"
      ? "bg-eco text-white ring-eco/30"
      : type === "Hybrid"
        ? "bg-accent text-accent-foreground ring-primary/15"
        : "bg-card text-foreground/80 ring-border";
  const Icon = type === "Electric" ? Zap : type === "Hybrid" ? Leaf : Fuel;
  return (
    <span className={cn(pill, style, className)}>
      <Icon className="size-3.5" aria-hidden />
      {type}
    </span>
  );
}

const STATUS: Record<string, string> = {
  Confirmed: "bg-eco-soft text-eco ring-eco/20",
  Pending: "bg-amber-soft text-amber-800 ring-amber/30 dark:text-amber-200",
  Completed: "bg-secondary text-foreground/70 ring-border",
  Cancelled: "bg-destructive/10 text-destructive ring-destructive/20",
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
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {status}
    </span>
  );
}
