// Roles used across the app. Kept free of server-only imports so the
// middleware, API routes and client components can all share it.

export type AppRole = "admin" | "reviewer" | "user";

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  reviewer: "Reviewer",
  user: "Customer",
};

export const READ_ONLY_MESSAGE =
  "The reviewer role is read-only, so this change wasn't saved.";

/** better-auth allows comma-separated roles; this app assigns one. */
function roleList(role: string | null | undefined) {
  return (role || "user").split(",").map((r) => r.trim());
}

/** The single role the app acts on (admin wins over reviewer). */
export function primaryRole(role: string | null | undefined): AppRole {
  const roles = roleList(role);
  if (roles.includes("admin")) return "admin";
  if (roles.includes("reviewer")) return "reviewer";
  return "user";
}

/** Can open the admin area and read its data. */
export function canViewAdmin(role: string | null | undefined) {
  return primaryRole(role) !== "user";
}

/** Can create, change or delete data from the admin area. */
export function canEditAdmin(role: string | null | undefined) {
  return primaryRole(role) === "admin";
}

export function isReviewer(role: string | null | undefined) {
  return primaryRole(role) === "reviewer";
}

/**
 * better-auth endpoints a reviewer may not call. The reviewer account can be
 * shared publicly, so it must not be able to change its own profile,
 * credentials or linked accounts, see or end other people's sessions on the
 * same account, or use the admin plugin's user management.
 */
const REVIEWER_BLOCKED_AUTH_PATHS = [
  "/update-user",
  "/change-email",
  "/change-password",
  "/delete-user",
  "/link-social",
  "/unlink-account",
  "/list-sessions",
  "/revoke-session",
  "/revoke-sessions",
  "/revoke-other-sessions",
  "/update-session",
  "/admin",
];

export function isBlockedForReviewer(path: string) {
  return REVIEWER_BLOCKED_AUTH_PATHS.some(
    (blocked) => path === blocked || path.startsWith(`${blocked}/`)
  );
}
