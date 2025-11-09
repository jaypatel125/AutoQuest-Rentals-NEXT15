import Link from "next/link";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white overflow-hidden space-y-6">
      <div className="flex items-center h-full">
        <Link href="/">
          <p className="text-3xl font-extrabold tracking-tight text-primary underline">
            Auto<span className="text-blue-600">Quest</span>
          </p>
        </Link>
      </div>

      <div className="w-full max-w-md px-8">{children}</div>
    </div>
  );
}
