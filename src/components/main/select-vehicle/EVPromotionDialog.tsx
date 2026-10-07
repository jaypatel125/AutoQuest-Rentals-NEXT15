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
      <DialogContent className="gap-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Make a Greener Choice!
          </DialogTitle>
          <DialogDescription>
            Before you book, here&apos;s what switching to electric gets you.
          </DialogDescription>
        </DialogHeader>

        <dl className="divide-y border-y text-sm">
          <div className="py-4">
            <dt className="font-medium">Carbon Emissions Impact</dt>
            <dd className="mt-1 text-muted-foreground">
              Zero tailpipe emissions. A typical gas car emits about 14 kg of
              CO₂ on an average day of driving.
            </dd>
          </div>
          <div className="py-4">
            <dt className="font-medium">EV Rewards Available</dt>
            <dd className="mt-1 text-muted-foreground">
              Book an EV and earn{" "}
              <span className="text-foreground">2x reward points</span>, which
              you can redeem for discounts on future rentals.
            </dd>
          </div>
        </dl>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" onClick={onContinue}>
            Continue Booking
          </Button>
          <Button onClick={onCheckoutEV}>Checkout EVs</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
