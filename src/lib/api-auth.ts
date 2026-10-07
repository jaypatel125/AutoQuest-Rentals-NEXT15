import { NextResponse } from "next/server";
import { getServerSideSession } from "@/hooks/SessionHandler";

type SessionUser = NonNullable<
  Awaited<ReturnType<typeof getServerSideSession>>["user"]
>;

type Guard =
  | { user: SessionUser; error?: undefined }
  | { user?: undefined; error: NextResponse };

/** Resolves the signed-in user, or a 401 response to return as-is. */
export async function requireUser(): Promise<Guard> {
  const session = await getServerSideSession();
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user: session.user };
}

/** Resolves the signed-in admin, or a 401/403 response to return as-is. */
export async function requireAdmin(): Promise<Guard> {
  const result = await requireUser();
  if (result.error) return result;
  if (result.user.role !== "admin") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return result;
}
