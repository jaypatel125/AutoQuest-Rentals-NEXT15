import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-col items-center justify-center bg-white p-8 min-h-[calc(100vh-112px)]">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
