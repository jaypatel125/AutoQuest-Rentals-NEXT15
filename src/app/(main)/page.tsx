import HomePage from "@/components/main/home";
import { getReviewerDemo } from "@/lib/reviewer-demo";

export default function Home() {
  return <HomePage reviewerDemo={getReviewerDemo()} />;
}
