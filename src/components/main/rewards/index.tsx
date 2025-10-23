"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Gift, Leaf, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

const RewardsPage = () => {
  const router = useRouter();
  return (
    <div className="py-6 space-y-10">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft /> Back
      </Button>

      <div className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight">EV Rewards Program</h1>
        <p className="text-muted-foreground">
          Drive green, earn rewards, and enjoy exclusive benefits every time you
          rent an electric vehicle.
        </p>
      </div>

      <Separator />

      {/* Reward Highlights */}
      <section className="grid md:grid-cols-3 gap-8">
        <Card className="text-center hover:shadow-md transition">
          <CardContent className="p-8 space-y-3">
            <Gift className="h-10 w-10 mx-auto text-green-600" />
            <h3 className="text-lg font-semibold">Earn Points</h3>
            <p className="text-sm text-muted-foreground">
              Earn <span className="font-semibold">2x points</span> on every EV
              rental. The longer you rent, the more points you get.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-md transition">
          <CardContent className="p-8 space-y-3">
            <Trophy className="h-10 w-10 mx-auto text-green-600" />
            <h3 className="text-lg font-semibold">Redeem Rewards</h3>
            <p className="text-sm text-muted-foreground">
              Use your points for future rental discounts, upgrades, or
              exclusive EV experiences.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-md transition">
          <CardContent className="p-8 space-y-3">
            <Leaf className="h-10 w-10 mx-auto text-green-600" />
            <h3 className="text-lg font-semibold">Drive Sustainably</h3>
            <p className="text-sm text-muted-foreground">
              Contribute to a cleaner tomorrow by choosing eco-friendly electric
              vehicles.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Program Details */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">How It Works</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
          <li>Sign up or log in to your account.</li>
          <li>Book any electric vehicle through our platform.</li>
          <li>Earn reward points automatically after each completed trip.</li>
          <li>Track your points in your bookings page.</li>
          <li>Redeem points for discounts or free upgrades.</li>
        </ul>
      </section>

      {/* Terms and Conditions */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Terms & Conditions</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
          <li>
            Points are earned only for completed electric vehicle rentals.
            Cancelled or refunded bookings are not eligible for points.
          </li>

          <li>
            Rewards are non-transferable and cannot be exchanged for cash.
          </li>
          <li>
            The company reserves the right to modify or terminate the rewards
            program at any time.
          </li>
          <li>
            Misuse of the rewards system may result in account suspension.
          </li>
        </ul>
      </section>
    </div>
  );
};

export default RewardsPage;
