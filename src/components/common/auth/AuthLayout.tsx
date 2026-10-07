import { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex h-16 items-center justify-between px-5 sm:px-8">
        <Logo />
        <ThemeToggle />
      </div>
      <div className="flex flex-1 items-center justify-center px-5 pt-8 pb-24 sm:px-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
