// app/confirmation/page.tsx (Server Component)
import { redirect } from "next/navigation";
import { stripe } from "../../lib/stripe";
import BookingDetailsClient from "@/components/confirmation/BookingDetailsClient";

interface ConfirmationPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function ConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const sessionId = Array.isArray(searchParams.session_id)
    ? searchParams.session_id[0]
    : searchParams.session_id;

  if (!sessionId) {
    throw new Error("Please provide a valid session_id (`cs_test_...`)");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "payment_intent"],
  });

  const { status, customer_details, amount_total, currency, metadata } =
    session;

  if (status === "open") {
    return redirect("/");
  }

  return (
    <BookingDetailsClient
      status={status!}
      customerEmail={customer_details?.email ?? ""}
      amountTotal={amount_total}
      currency={currency ?? "CAD"}
      metadata={metadata ?? {}}
    />
  );
}
