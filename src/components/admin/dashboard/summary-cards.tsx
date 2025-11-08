import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { DollarSign, Car, Users, XCircle } from "lucide-react";

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

export const SummaryCards: React.FC<SummaryCardsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPrice(data.summary.total_revenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            {data.summary.total_completed_rentals} completed rentals
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Fleet Utilization
          </CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.fleet.available_pct.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {data.fleet.available_cars} of {data.fleet.total_cars} cars
            available
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Unique Customers
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(data.summary.unique_customers)}
          </div>
          <p className="text-xs text-muted-foreground">
            Avg {data.summary.avg_days.toFixed(1)} days per rental
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Cancellation Rate
          </CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.cancellation.cancel_pct.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {data.cancellation.cancelled_count} of{" "}
            {data.cancellation.total_bookings} bookings
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
