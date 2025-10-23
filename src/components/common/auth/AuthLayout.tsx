import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white overflow-hidden">
      <div className="w-full max-w-md px-8">{children}</div>
    </div>
  );
}
