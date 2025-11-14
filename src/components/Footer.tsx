"use client";

import { usePathname } from "next/navigation";
import MaxWidthWrapper from "./utility/MaxWidthWrapper";
import { isAuthRoutes } from "@/lib/utils";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const pathname = usePathname();
  if (isAuthRoutes(pathname)) {
    return null;
  }
  return (
    <footer className=" mt-auto bg-gray-900 text-gray-300 py-8">
      <MaxWidthWrapper className="flex flex-col justify-center items-center ">
        {/* Logo */}
        <Link className="flex-1" href="/">
          <Image
            src="/logo-2.png"
            width={160}
            height={30}
            alt="AutoQuest logo"
            className="invert"
          />
        </Link>
        <div className="flex-2 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} AutoQuest. All rights reserved.
        </div>
      </MaxWidthWrapper>
    </footer>
  );
}
