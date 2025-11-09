import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white overflow-hidden space-y-4">
      <div className="flex items-center h-full">
        <Link href="/">
          <Image
            src="/logo-2.png"
            width={175}
            height={30}
            alt="AutoQuest logo"
          />
        </Link>
      </div>

      <div className="w-full max-w-md px-8">{children}</div>
    </div>
  );
}
