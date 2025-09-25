// components/utility/MaxWidthWrapper.tsx
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const MaxWidthWrapper = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8", // Use mx-auto for centering
        className
      )}
    >
      {children}
    </div>
  );
};

export default MaxWidthWrapper;
