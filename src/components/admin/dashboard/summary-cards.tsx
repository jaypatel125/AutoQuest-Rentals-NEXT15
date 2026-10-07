import { formatPrice } from "@/lib/utils";

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
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="bg-background p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-medium tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 xl:grid-cols-4">
      <Stat
        label="Total Revenue"
        value={formatPrice(data.summary.total_revenue)}
        hint={`${data.summary.total_completed_rentals} completed rentals`}
      />
      <Stat
        label="Fleet Availability"
        value={`${data.fleet.available_pct.toFixed(1)}%`}
        hint={`${data.fleet.available_cars} of ${data.fleet.total_cars} cars available`}
      />
      <Stat
        label="Unique Customers"
        value={formatNumber(data.summary.unique_customers)}
        hint={`Avg ${data.summary.avg_days.toFixed(1)} days per rental`}
      />
      <Stat
        label="Cancellation Rate"
        value={`${data.cancellation.cancel_pct.toFixed(1)}%`}
        hint={`${data.cancellation.cancelled_count} of ${data.cancellation.total_bookings} bookings`}
      />
    </div>
  );
};
