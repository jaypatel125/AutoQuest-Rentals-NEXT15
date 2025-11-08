import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
} from "recharts";

interface CarbonTabProps {
  data: {
    carbonEmissions: Array<{
      month: string;
      total_carbon_emissions: number;
      avg_carbon_per_booking: number;
    }>;
    fuelTypePerformance: Array<{
      fuel_type: string;
      avg_carbon_emissions: number;
      rental_count: number;
    }>;
    carbonByBodyType: Array<{
      body_type: string;
      total_carbon_emitted: number;
      rental_count: number;
    }>;
    topBranches: Array<{
      id: string;
      name: string;
      city: string;
      revenue_per_carbon_unit: number;
    }>;
  };
}

export const CarbonTab: React.FC<CarbonTabProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Carbon Emissions Trend</CardTitle>
            <CardDescription>
              Monthly carbon emissions from rentals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.carbonEmissions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="total_carbon_emissions"
                  stroke="#0088FE"
                  name="Total Carbon Emissions"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avg_carbon_per_booking"
                  stroke="#00C49F"
                  name="Avg Carbon per Booking"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carbon Efficiency by Fuel Type</CardTitle>
            <CardDescription>
              Average carbon emissions per fuel type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2 text-center">
                  Avg Carbon Emissions by Fuel Type
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.fuelTypePerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fuel_type" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="avg_carbon_emissions"
                      fill="#0088FE"
                      name="Avg Carbon Emissions"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2 text-center">
                  Rental Count by Fuel Type
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.fuelTypePerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fuel_type" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="rental_count"
                      fill="#00C49F"
                      name="Rental Count"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carbon Emissions by Body Type</CardTitle>
            <CardDescription>
              Environmental impact by vehicle type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data.carbonByBodyType.map((item) => ({
                  ...item,
                  carbon_per_rental:
                    item.total_carbon_emitted / item.rental_count,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="body_type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="carbon_per_rental"
                  name="Carbon per Rental"
                  fill="#0088FE"
                />
                <Bar
                  dataKey="rental_count"
                  name="Rental Count"
                  fill="#00C49F"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branch Carbon Efficiency</CardTitle>
            <CardDescription>Revenue per carbon unit by branch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topBranches.map((branch) => (
                <div
                  key={branch.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{branch.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {branch.city}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      ${branch.revenue_per_carbon_unit.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      per carbon unit
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
