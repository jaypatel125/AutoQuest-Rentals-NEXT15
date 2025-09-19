import { NextResponse, type NextRequest } from "next/server";
import { Session } from "../auth";
import { betterFetch } from "@better-fetch/fetch";

const authRoutes = ["/signin", "/signup"];
const passwordRoutes = ["/reset-password", "/forgot-password"];
const adminRoutes = ["/dashboard"];
const protectedRoutes = ["/account", "/checkout", "/addproduct"];

export default async function authMiddleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;

  const isAuthRoute = authRoutes.includes(pathName);
  const isPasswordRoute = passwordRoutes.includes(pathName);
  const isAdminRoute = adminRoutes.includes(pathName);
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathName.startsWith(route)
  );

  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // });
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: process.env.NEXT_PUBLIC_APP_URL,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    }
  );

  // console.log(session);

  if ((isAuthRoute || isPasswordRoute) && !session) {
    return NextResponse.next();
  }

  if ((isAuthRoute || isPasswordRoute) && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAdminRoute && session?.user.role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const runtime = "nodejs";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
