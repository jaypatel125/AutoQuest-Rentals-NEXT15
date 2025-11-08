import React from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { ReloadIcon } from "@radix-ui/react-icons";

interface LoaderProps {
  error?: string;
}

const Error: React.FC<LoaderProps> = ({ error }) => {
  const router = useRouter();
  return (
    <div className="flex items-center justify-center h-96">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="text-lg text-red-500 font-medium">
          {error ? error : "Something went wrong. Please try again."}
        </div>
        <Button onClick={() => router.refresh()}>
          <ReloadIcon />
          Retry
        </Button>
      </div>
    </div>
  );
};

export default Error;
