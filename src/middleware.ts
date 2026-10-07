import { NextResponse, type NextRequest } from "next/server";
import { Session } from "../auth";
import { betterFetch } from "@better-fetch/fetch";

const authRoutes = ["/signin", "/signup"];
const passwordRoutes = ["/reset-password", "/forgot-password"];

// Admin-only sections
const adminRoutes = ["/admin"];

// Regular user-only protected routes
const protectedRoutes = ["/account", "/checkout", "/bookings", "/confirmation"];

const matches = (path: string, routes: string[]) =>
  routes.some((route) => path === route || path.startsWith(`${route}/`));

export default async function authMiddleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;

  const isAuthRoute = matches(pathName, authRoutes);
  const isPasswordRoute = matches(pathName, passwordRoutes);
  const isAdminRoute = matches(pathName, adminRoutes);
  const isProtectedRoute = matches(pathName, protectedRoutes);

  const session = await getSession(request);

  // Admins work inside /admin (plus their own profile).
  if (session?.user.role === "admin") {
    if (isAdminRoute || matches(pathName, ["/account"])) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if ((isAuthRoute || isPasswordRoute) && !session) {
    return NextResponse.next();
  }

  // Signed-in customers don't need the sign-in/sign-up/reset pages.
  if ((isAuthRoute || isPasswordRoute) && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAdminRoute) {
    if (!session) {
      return redirectToSignIn(request);
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isProtectedRoute && !session) {
    return redirectToSignIn(request);
  }

  return NextResponse.next();
}

/**
 * Looks up the current session. If the auth endpoint is unreachable the
 * visitor is treated as signed out, so public pages still load and
 * protected pages fall back to the sign-in redirect.
 */
async function getSession(request: NextRequest): Promise<Session | null> {
  try {
    const { data } = await betterFetch<Session>("/api/auth/get-session", {
      baseURL: process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });
    return data ?? null;
  } catch (err) {
    console.error("Session lookup failed in middleware:", err);
    return null;
  }
}

/** Sends the visitor to sign in and back to where they were afterwards. */
function redirectToSignIn(request: NextRequest) {
  const url = new URL("/signin", request.url);
  const next = request.nextUrl.pathname + request.nextUrl.search;
  if (next !== "/") url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|txt|xml|webmanifest)$).*)",
  ],
};
