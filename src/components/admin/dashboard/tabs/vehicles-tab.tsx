import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatPrice } from "@/lib/utils";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

interface VehiclesTabProps {
  data: {
    utilization: Array<{
      id: string;
      brand: string;
      model: string;
      booked_days: number;
      utilization_pct: number;
    }>;
    fuelTypePerformance: Array<{ fuel_type: string; total_revenue: number }>;
  };
}

export const VehiclesTab: React.FC<VehiclesTabProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Utilization</CardTitle>
            <CardDescription>Top utilized vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.utilization.slice(0, 10).map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {vehicle.brand} {vehicle.model}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {vehicle.booked_days} booked days
                    </div>
                  </div>
                  <Badge
                    variant={
                      vehicle.utilization_pct > 80 ? "destructive" : "secondary"
                    }
                  >
                    {vehicle.utilization_pct.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fuel Type Performance</CardTitle>
            <CardDescription>Revenue and rental distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] md:contents">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.fuelTypePerformance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ fuel_type }) => `${fuel_type}`}
                  outerRadius={130}
                  fill="#8884d8"
                  dataKey="total_revenue"
                >
                  {data.fuelTypePerformance.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatPrice(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
