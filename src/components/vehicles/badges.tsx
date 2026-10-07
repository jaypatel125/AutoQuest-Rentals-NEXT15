import { Fuel, Leaf, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { greenScore, type GreenScore } from "@/lib/green";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TONES: Record<GreenScore["tone"], string> = {
  emerald:
    "bg-emerald-500/15 text-emerald-700 ring-emerald-600/25 dark:text-emerald-300",
  green: "bg-green-500/15 text-green-700 ring-green-600/25 dark:text-green-300",
  lime: "bg-lime-500/20 text-lime-800 ring-lime-600/25 dark:text-lime-300",
  amber: "bg-amber-500/15 text-amber-800 ring-amber-600/25 dark:text-amber-300",
  orange:
    "bg-orange-500/15 text-orange-700 ring-orange-600/25 dark:text-orange-300",
  red: "bg-red-500/15 text-red-700 ring-red-600/25 dark:text-red-300",
};

const pill =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset whitespace-nowrap";

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
        <span
          className={cn(pill, TONES[score.tone], "backdrop-blur", className)}
        >
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
      ? "bg-emerald-600 text-white ring-emerald-700/20"
      : type === "Hybrid"
        ? "bg-teal-500/15 text-teal-800 ring-teal-600/25 dark:text-teal-200"
        : "bg-slate-500/10 text-slate-700 ring-slate-500/20 dark:text-slate-300";
  const Icon = type === "Electric" ? Zap : type === "Hybrid" ? Leaf : Fuel;
  return (
    <span className={cn(pill, style, className)}>
      <Icon className="size-3.5" aria-hidden />
      {type}
    </span>
  );
}

const STATUS: Record<string, string> = {
  Confirmed:
    "bg-emerald-500/15 text-emerald-700 ring-emerald-600/25 dark:text-emerald-300",
  Pending:
    "bg-amber-500/15 text-amber-800 ring-amber-600/25 dark:text-amber-300",
  Completed: "bg-sky-500/15 text-sky-700 ring-sky-600/25 dark:text-sky-300",
  Cancelled: "bg-rose-500/12 text-rose-700 ring-rose-600/25 dark:text-rose-300",
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
