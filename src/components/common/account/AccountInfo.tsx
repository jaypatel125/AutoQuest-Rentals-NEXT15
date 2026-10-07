import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AccountInfoProps = {
  label: string;
  currentInfo: string | React.ReactNode;
  icon?: React.ReactNode;
  isSuccess?: boolean;
  isError?: boolean;
  errorMessage?: string;
  clearState: () => void;
  children?: React.ReactNode;
  "data-testid"?: string;
  isLoading?: boolean;
};

const AccountInfo = ({
  label,
  currentInfo,
  icon,
  isSuccess,
  clearState,
  children,
  "data-testid": dataTestid,
  isLoading,
}: AccountInfoProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    clearState();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (isSuccess) {
      setIsOpen(false);
    }
  }, [isSuccess]);

  return (
    <div data-testid={dataTestid} className="w-full">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {icon && (
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              {icon}
            </span>
          )}
          <div className="min-w-0 space-y-0.5">
            <span className="text-sm font-semibold">{label}</span>
            <div className="truncate text-sm text-muted-foreground">
              {typeof currentInfo === "string" ? (
                <span data-testid="current-info">{currentInfo}</span>
              ) : (
                currentInfo
              )}
            </div>
          </div>
        </div>
        <Button
          variant={isOpen ? "ghost" : "outline"}
          size="sm"
          iconType={isOpen ? "close" : "edit"}
          onClick={handleToggle}
          type={isOpen ? "reset" : "button"}
          data-testid="edit-button"
          data-active={isOpen}
        >
          {isOpen ? "Cancel" : "Edit"}
        </Button>
      </div>

      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
        aria-hidden={!isOpen}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 pt-5">
            <div className="w-full">{children}</div>
            <Button
              iconType="submit"
              className="w-full sm:w-auto"
              type="submit"
              data-testid="save-button"
              disabled={isLoading}
              loading={isLoading}
              tabIndex={isOpen ? 0 : -1}
            >
              Save changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;
