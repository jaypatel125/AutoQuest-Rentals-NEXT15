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
    <div className={cn(" h-full mx-2 px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
};

export default MaxWidthWrapper;
