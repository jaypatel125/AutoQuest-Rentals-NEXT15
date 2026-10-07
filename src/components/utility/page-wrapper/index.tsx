"use client";

import { usePathname } from "next/navigation";

/** Fades each page in on navigation (CSS only, respects reduced motion). */
export function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="flex flex-1 flex-col animate-fade-in">
      {children}
    </div>
  );
}
