import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "recharts";

const CARBON_COLORS = [
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFC107",
  "#FF9800",
  "#F44336",
];

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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

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
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total_carbon_emissions"
                  stroke="#0088FE" // Changed from orange to blue
                  name="Total Carbon Emissions"
                />
                <Line
                  type="monotone"
                  dataKey="avg_carbon_per_booking"
                  stroke="#00C49F" // Changed to green
                  name="Avg Carbon per Booking"
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.fuelTypePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fuel_type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="avg_carbon_emissions"
                  name="Avg Carbon Emissions"
                  fill="#0088FE"
                />{" "}
                {/* Changed from orange */}
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
            <CardTitle>Carbon Emissions by Body Type</CardTitle>
            <CardDescription>
              Environmental impact by vehicle type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.carbonByBodyType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="body_type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="total_carbon_emitted"
                  name="Total Carbon Emitted"
                  fill="#0088FE"
                />{" "}
                {/* Changed from orange */}
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
