"use client";

import { usePathname } from "next/navigation";
import MaxWidthWrapper from "./utility/MaxWidthWrapper";
import { isAuthRoutes } from "@/lib/utils";

export default function Footer() {
  const pathname = usePathname();
  if (isAuthRoutes(pathname)) {
    return null;
  }
  return (
    <footer className="bg-gray-900 text-gray-300 py-8">
      <MaxWidthWrapper>
        {/* Logo */}
        <p className="text-xl text-center font-semibold tracking-tight text-gray-300 underline">
          AutoQuest
        </p>
        <div className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} AutoQuest. All rights reserved.
        </div>
      </MaxWidthWrapper>
    </footer>
  );
}
