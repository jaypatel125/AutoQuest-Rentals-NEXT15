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
import { Gift, Leaf } from "lucide-react";
import { CarIllustration } from "@/components/vehicles/CarIllustration";

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
      <DialogContent className="overflow-hidden p-0 sm:max-w-md">
        <div className="bg-hero px-10 pt-8 pb-4">
          <CarIllustration bodyType="Hatchback" color="#10b981" />
        </div>
        <div className="space-y-5 px-6 pb-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Make a Greener Choice!
            </DialogTitle>
            <DialogDescription>
              Before you book, here&apos;s what switching to electric gets you.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl bg-accent/60 p-3">
              <Leaf className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">Carbon Emissions Impact</p>
                <p className="text-sm text-muted-foreground">
                  Zero tailpipe emissions. A typical gas car emits about 14 kg
                  of CO₂ on an average day of driving.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-accent/60 p-3">
              <Gift className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">EV Rewards Available</p>
                <p className="text-sm text-muted-foreground">
                  Book an EV and earn{" "}
                  <strong className="text-foreground">2x reward points</strong>.
                  Points can be redeemed for discounts on future rentals.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              variant="outline"
              iconType="right-arrow"
              onClick={onContinue}
            >
              Continue Booking
            </Button>
            <Button onClick={onCheckoutEV}>
              <Leaf /> Checkout EVs
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
