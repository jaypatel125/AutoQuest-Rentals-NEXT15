"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface PageLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  description,
  children,
}) => {
  const router = useRouter();
  return (
    <div className="py-6 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft /> Back
      </Button>
      <div className="flex gap-4">
        <div className="w-2 h-15 bg-gray-600 rounded-full"></div>
        <div className="space-y-2 ">
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      <Separator />
      {children}
    </div>
  );
};

export default PageLayout;
