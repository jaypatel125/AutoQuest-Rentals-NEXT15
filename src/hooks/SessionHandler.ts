import { headers } from "next/headers";
import { auth } from "../../auth";

export async function getServerSideSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return {
    session: session?.session || null,
    user: session?.user,
  };
}
