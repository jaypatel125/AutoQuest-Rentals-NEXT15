import { redirect } from "next/navigation";
import ConfirmationDetails from "@/components/main/confirmation";
import { getCheckoutSession } from "@/app/(main)/confirmation/action";
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

  const session = await getCheckoutSession(sessionId || "");

  const { status, customer_details, amount_total, currency, metadata } =
    session;

  if (status === "open") {
    return redirect("/");
  }

  return (
    <ConfirmationDetails
      status={status!}
      customerEmail={customer_details?.email ?? ""}
      amountTotal={amount_total}
      currency={currency ?? "CAD"}
      metadata={metadata ?? {}}
    />
  );
}
