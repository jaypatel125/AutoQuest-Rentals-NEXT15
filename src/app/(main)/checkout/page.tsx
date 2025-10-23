import Checkout from "@/components/main/checkout";
import { getServerSideSession } from "@/hooks/SessionHandler";
import { notFound } from "next/navigation";

export default async function CheckoutPage() {
  const { user } = await getServerSideSession();

  if (!user) {
    notFound();
  }
  return <Checkout user={user} />;
}
