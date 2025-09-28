"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

interface EVPromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckoutEV: () => void;
  onContinue: () => void;
  carbonSaved?: number;
  rewards?: number;
}

export function EVPromotionDialog({
  open,
  onOpenChange,
  onCheckoutEV,
  onContinue,
  carbonSaved = 4.7,
  rewards = 47,
}: EVPromotionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Make a Greener Choice!
          </DialogTitle>
          <DialogDescription>
            Consider the environmental impact of your choice
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Carbon Impact */}
          <div className="flex items-start space-x-3">
            <Leaf className="h-5 w-5 text-green-600 mt-1" />
            <div>
              <p className="font-medium">Carbon Emissions Impact</p>
              <p className="text-sm text-muted-foreground">
                Switching to an EV would reduce emissions by{" "}
                <span className="text-green-600 font-medium">
                  {carbonSaved}kg CO₂
                </span>
              </p>
            </div>
          </div>

          {/* Rewards */}
          <div className="flex items-start space-x-3">
            <Leaf className="h-5 w-5 text-blue-600 mt-1" />
            <div>
              <p className="font-medium">EV Rewards Available</p>
              <p className="text-sm text-muted-foreground">
                Book an EV instead and earn{" "}
                <span className="text-blue-600 font-medium">
                  {rewards} points
                </span>
                . Points can be used for future discounts.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between gap-2">
          <Button variant="outline" onClick={onContinue}>
            Continue Booking
          </Button>
          <Button onClick={onCheckoutEV}>Checkout EVs</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
