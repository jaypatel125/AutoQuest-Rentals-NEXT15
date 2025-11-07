import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CustomersTabProps {
  data: {
    topUsers: Array<{
      id: string;
      name: string;
      email: string;
      total_rentals: number;
      total_spent: number;
    }>;
    rewardsAnalytics: Array<{
      id: string;
      name: string;
      email: string;
      reward_points: number;
      total_transactions: number;
    }>;
    rewards: {
      points_earned: number;
      points_redeemed: number;
    };
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US").format(num);
};

export const CustomersTab: React.FC<CustomersTabProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Rewards Summary</CardTitle>
            <CardDescription>Points earned vs redeemed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(data.rewards.points_earned)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Points Earned
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(data.rewards.points_redeemed)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Points Redeemed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>By number of rentals and spending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {user.total_rentals} rentals
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(user.total_spent)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rewards Program Analytics</CardTitle>
            <CardDescription>Top users by reward points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.rewardsAnalytics.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {formatNumber(user.reward_points)} pts
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.total_transactions} transactions
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
