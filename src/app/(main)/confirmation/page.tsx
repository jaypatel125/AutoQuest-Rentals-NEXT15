import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ConfirmationDetails from "@/components/main/confirmation";
import { getConfirmation } from "@/app/(main)/confirmation/action";

export const metadata: Metadata = { title: "Booking confirmed" };
export const dynamic = "force-dynamic";

interface ConfirmationPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const params = await searchParams;
  const sessionId = Array.isArray(params.session_id)
    ? params.session_id[0]
    : params.session_id;

  const data = await getConfirmation(sessionId);

  // Unknown or someone else's session: nothing to show here.
  if (!data) {
    return redirect("/bookings");
  }
  if (data.status !== "complete") {
    return redirect("/checkout?cancelled=1");
  }

  return <ConfirmationDetails data={data} />;
}
