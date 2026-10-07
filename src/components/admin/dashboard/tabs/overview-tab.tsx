import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { formatPrice } from "@/lib/utils";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "oklch(0.7 0.11 190)",
];

interface OverviewTabProps {
  data: {
    dailyTrend: Array<{ day: string; rentals: number; revenue: number }>;
    bookingStatus: Array<{ status: string; count: number; percentage: number }>;
    topVehicles: Array<{
      model: string;
      rental_count: number;
      total_revenue: number;
    }>;
    topBranches: Array<{
      id: string;
      name: string;
      city: string;
      total_revenue: number;
      total_bookings: number;
    }>;
  };
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ data }) => {
  return (
    <div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Rentals & Revenue</CardTitle>
            <CardDescription>Trend over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.dailyTrend}>
                <CartesianGrid vertical={false} />
                <XAxis axisLine={false} tickLine={false} dataKey="day" />
                <YAxis axisLine={false} tickLine={false} yAxisId="left" />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  yAxisId="right"
                  orientation="right"
                />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="rentals"
                  stroke="var(--chart-2)"
                  strokeWidth={1.5}
                  fill="var(--chart-4)"
                  fillOpacity={0}
                  name="Rentals"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--chart-1)"
                  strokeWidth={1.5}
                  fillOpacity={0}
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Status Distribution</CardTitle>
            <CardDescription>Current booking status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.bookingStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percentage }) =>
                    `${status}: ${percentage}%`
                  }
                  innerRadius={52}
                  outerRadius={80}
                  stroke="var(--background)"
                  strokeWidth={2}
                  fill="var(--chart-4)"
                  dataKey="count"
                >
                  {data.bookingStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Vehicles</CardTitle>
            <CardDescription>By rental count and revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topVehicles}>
                <CartesianGrid vertical={false} />
                <XAxis axisLine={false} tickLine={false} dataKey="model" />
                <YAxis axisLine={false} tickLine={false} yAxisId="left" />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  yAxisId="right"
                  orientation="right"
                />
                <Tooltip />
                <Legend />
                <Bar
                  radius={[2, 2, 0, 0]}
                  maxBarSize={28}
                  yAxisId="left"
                  dataKey="rental_count"
                  name="Rental Count"
                  fill="var(--chart-2)"
                />
                <Bar
                  radius={[2, 2, 0, 0]}
                  maxBarSize={28}
                  yAxisId="right"
                  dataKey="total_revenue"
                  name="Total Revenue"
                  fill="var(--chart-1)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branch Performance</CardTitle>
            <CardDescription>Revenue and booking metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              {data.topBranches.map((branch) => (
                <div
                  key={branch.id}
                  className="flex items-center justify-between border-b py-3 last:border-b-0"
                >
                  <div>
                    <div className="font-medium">{branch.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {branch.city}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="tabular-nums">
                      {formatPrice(branch.total_revenue)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {branch.total_bookings} bookings
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
