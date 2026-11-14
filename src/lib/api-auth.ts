import { NextResponse } from "next/server";
import { getServerSideSession } from "@/hooks/SessionHandler";
import { canEditAdmin, canViewAdmin, READ_ONLY_MESSAGE } from "@/lib/roles";

type SessionUser = NonNullable<
  Awaited<ReturnType<typeof getServerSideSession>>["user"]
>;

type Guard =
  | { user: SessionUser; error?: undefined }
  | { user?: undefined; error: NextResponse };

type ViewerGuard =
  | { user: SessionUser; readOnly: boolean; error?: undefined }
  | { user?: undefined; readOnly?: undefined; error: NextResponse };

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

/**
 * For routes that change data: admins only. Reviewers get a 403 that says
 * the role is read-only, so the UI can show a clear message.
 */
export async function requireAdmin(): Promise<Guard> {
  const result = await requireUser();
  if (result.error) return result;
  if (!canEditAdmin(result.user.role)) {
    const readOnly = canViewAdmin(result.user.role);
    return {
      error: NextResponse.json(
        { error: readOnly ? READ_ONLY_MESSAGE : "Forbidden" },
        { status: 403 }
      ),
    };
  }
  return result;
}

/**
 * For routes that only read admin data: admins and reviewers. `readOnly` is
 * true for reviewers, whose responses should hide personal details.
 */
export async function requireAdminViewer(): Promise<ViewerGuard> {
  const result = await requireUser();
  if (result.error) return result;
  if (!canViewAdmin(result.user.role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { user: result.user, readOnly: !canEditAdmin(result.user.role) };
}
