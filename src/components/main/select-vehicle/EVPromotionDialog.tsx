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
}

export function EVPromotionDialog({
  open,
  onOpenChange,
  onCheckoutEV,
  onContinue,
}: EVPromotionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Make a Greener Choice!
          </DialogTitle>
          <DialogDescription>
            Consider the environmental impact of your choice
          </DialogDescription>
        </DialogHeader>

        {/* Carbon Impact */}
        <div className="flex items-start space-x-3">
          <Leaf className="h-5 w-5 text-green-600 mt-1" />
          <div>
            <p className="font-medium">Carbon Emissions Impact</p>
            <p className="text-sm text-muted-foreground">
              Switching to an EV can reduce emissions by{" "}
              <span className="text-green-600 font-medium">
                up to 2,000 kg CO₂ per year
              </span>
              .
            </p>
          </div>
        </div>

        {/* Rewards */}
        <div className="flex items-start space-x-3">
          <Leaf className="h-5 w-5 text-blue-600 mt-1" />
          <div>
            <p className="font-medium">EV Rewards Available</p>
            <p className="text-sm text-muted-foreground">
              Book an EV and earn{" "}
              <span className="text-blue-600 font-medium">
                2x reward points
              </span>
              . Points can be redeemed for discounts on future rentals.
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-between gap-2">
          <Button variant="outline" iconType="right-arrow" onClick={onContinue}>
            Continue Booking
          </Button>
          <Button iconType="view" onClick={onCheckoutEV}>
            Checkout EVs
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
