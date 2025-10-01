import React, { useState, useEffect } from "react";
import { Disclosure } from "@headlessui/react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

type AccountInfoProps = {
  label: string;
  currentInfo: string | React.ReactNode;
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
      <div className="flex items-center justify-between py-2">
        <div className="space-y-1 flex-1">
          <span className="text-base font-medium">{label}</span>
          <div className="text-muted-foreground text-sm">
            {typeof currentInfo === "string" ? (
              <span data-testid="current-info">{currentInfo}</span>
            ) : (
              currentInfo
            )}
          </div>
        </div>
        <div>
          <Button
            variant="outline"
            className="w-20 min-h-8"
            onClick={handleToggle}
            type={isOpen ? "reset" : "button"}
            data-testid="edit-button"
            data-active={isOpen}
          >
            {isOpen ? "Cancel" : "Edit"}
          </Button>
        </div>
      </div>

      {/* Editable state */}
      <Disclosure>
        <Disclosure.Panel
          static
          className={cn(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
            {
              "max-h-[1000px] opacity-100": isOpen,
              "max-h-0 opacity-0": !isOpen,
            }
          )}
        >
          <div className="py-4 space-y-4">
            <div className="w-full">{children}</div>
            <Button
              className="w-full sm:w-auto"
              variant="default"
              type="submit"
              data-testid="save-button"
              disabled={isLoading}
            >
              Save changes
            </Button>
          </div>
        </Disclosure.Panel>
      </Disclosure>
    </div>
  );
};

export default AccountInfo;
