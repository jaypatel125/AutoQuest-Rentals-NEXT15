import { NextResponse, type NextRequest } from "next/server";
import { Session } from "../auth";
import { betterFetch } from "@better-fetch/fetch";

const authRoutes = ["/signin", "/signup"];
const passwordRoutes = ["/reset-password", "/forgot-password"];

// Admin-only sections
const adminRoutes = ["/admin"];

// Regular user-only protected routes
const protectedRoutes = ["/account", "/checkout", "/bookings", "/confirmation"];

export default async function authMiddleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;

  const isAuthRoute = authRoutes.some((route) => pathName.startsWith(route));
  const isPasswordRoute = passwordRoutes.some((route) =>
    pathName.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => pathName.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathName.startsWith(route)
  );

  // Fetch current user session
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: process.env.NEXT_PUBLIC_APP_URL,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    }
  );

  // --- ADMIN-ONLY ENFORCEMENT ---
  // If user is logged in and is an admin, only allow /admin/* routes.
  if (session?.user.role === "admin") {
    if (isAdminRoute || pathName.startsWith("/account")) {
      return NextResponse.next(); // allow admin pages
    }
    // Any other route — including "/", auth pages, or protected user routes — redirect to /admin
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // --- Non-admin / unauthenticated flows ---

  // Allow unauthenticated users on auth & password routes
  if ((isAuthRoute || isPasswordRoute) && !session) {
    return NextResponse.next();
  }

  // Prevent logged-in non-admin users from accessing signin/signup/reset pages
  if ((isAuthRoute || isPasswordRoute) && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Block non-admins from admin routes
  if (isAdminRoute) {
    if (!session) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // Require authentication for user-protected routes
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
