import type { Metadata } from "next";
import ComparePage from "@/components/main/compare";

export const metadata: Metadata = {
  title: "Compare vehicles",
  description: "Compare price, emissions, and features side by side.",
};

export default function Compare() {
  return <ComparePage />;
}
