"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchDashboardData } from "@/app/(admin)/admin/actions";
import { SummaryCards } from "./summary-cards";
import { CarbonTab } from "./tabs/carbon-tab";
import { CustomersTab } from "./tabs/customers-tab";
import { OverviewTab } from "./tabs/overview-tab";
import { VehiclesTab } from "./tabs/vehicles-tab";
import Loader from "@/components/utility/Loader";
import Error from "@/components/utility/Error";

export const AdminDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats", timeRange],
    queryFn: () => fetchDashboardData(timeRange),
    refetchInterval: 60000,
  });

  if (isLoading) return <Loader title="Fetching latetst dashboard data" />;

  if (error || !data) {
    return <Error />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <SummaryCards data={data} />

      {/* Tabs */}
      {/* Tabs with responsive dropdown */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        {/* Desktop Tabs */}
        <TabsList className="hidden md:flex w-full justify-center gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="carbon">Carbon Analytics</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        {/* Mobile Dropdown */}
        <div className="md:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <div className="text-sm font-medium text-gray-700 mb-2">
              Select Section
            </div>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="carbon">Carbon Analytics</SelectItem>
              <SelectItem value="vehicles">Vehicles</SelectItem>
              <SelectItem value="customers">Customers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tab Contents */}
        <TabsContent value="overview" key="overview">
          <OverviewTab data={data} />
        </TabsContent>

        <TabsContent value="carbon" key="carbon">
          <CarbonTab data={data} />
        </TabsContent>

        <TabsContent value="vehicles" key="vehicles">
          <VehiclesTab data={data} />
        </TabsContent>

        <TabsContent value="customers" key="customers">
          <CustomersTab data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
