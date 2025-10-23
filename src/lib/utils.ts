import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "CAD",
  }).format(price);
}

export function formatDate(dateString: string | Date) {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function isAuthRoutes(pathname: string) {
  const authRoutes = [
    "/signin",
    "/signup",
    "/verification",
    "/forgot-password",
    "/reset-password",
  ];
  return authRoutes.includes(pathname);
}
