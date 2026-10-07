import { formatPrice } from "@/lib/utils";
import {
  CarFront,
  DollarSign,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";

interface SummaryCardsProps {
  data: {
    summary: {
      total_revenue: number;
      total_completed_rentals: number;
      unique_customers: number;
      avg_days: number;
    };
    fleet: {
      available_pct: number;
      available_cars: number;
      total_cars: number;
    };
    cancellation: {
      cancel_pct: number;
      cancelled_count: number;
      total_bookings: number;
    };
  };
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US").format(num);
};

function Stat({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span
          className={`inline-flex size-9 items-center justify-center rounded-xl ${tone}`}
        >
          <Icon className="size-[18px]" />
        </span>
      </div>
      <p className="mt-2 font-display text-3xl font-bold tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat
        label="Total Revenue"
        value={formatPrice(data.summary.total_revenue)}
        hint={`${data.summary.total_completed_rentals} completed rentals`}
        icon={DollarSign}
        tone="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
      />
      <Stat
        label="Fleet Availability"
        value={`${data.fleet.available_pct.toFixed(1)}%`}
        hint={`${data.fleet.available_cars} of ${data.fleet.total_cars} cars available`}
        icon={CarFront}
        tone="bg-sky-500/15 text-sky-700 dark:text-sky-300"
      />
      <Stat
        label="Unique Customers"
        value={formatNumber(data.summary.unique_customers)}
        hint={`Avg ${data.summary.avg_days.toFixed(1)} days per rental`}
        icon={Users}
        tone="bg-violet-500/15 text-violet-700 dark:text-violet-300"
      />
      <Stat
        label="Cancellation Rate"
        value={`${data.cancellation.cancel_pct.toFixed(1)}%`}
        hint={`${data.cancellation.cancelled_count} of ${data.cancellation.total_bookings} bookings`}
        icon={XCircle}
        tone="bg-rose-500/15 text-rose-700 dark:text-rose-300"
      />
    </div>
  );
};
