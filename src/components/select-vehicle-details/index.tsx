"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Fuel, CarFront, ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Cars as CarType } from "@/lib/database/table-types";
import { useFormatPrice } from "@/lib/utils";

type Props = {
  car: CarType;
  onRentNow: () => void;
  onBack: () => void;
};

export default function VehicleDetails({ car, onRentNow, onBack }: Props) {
  const { formatPrice } = useFormatPrice();

  return (
    <div className="space-y-6 my-6">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft /> Back
      </Button>

      <div className="grid md:grid-cols-2 gap-10 items-start">
        <Image
          src={car.image || "/car-placeholder.png"}
          alt={`${car.brand} ${car.model}`}
          width={700}
          height={400}
          className="rounded-lg shadow-md"
        />

        <div className=" space-y-8">
          <h1 className="text-3xl font-bold">
            {car.brand} {car.model}
          </h1>

          <div>
            <span className="font-semibold text-lg">
              {formatPrice(car.price_per_day)}
              <span className="text-sm font-normal">/day</span>
            </span>
          </div>

          <Card>
            <CardContent className="text-sm text-muted-foreground">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p>
                    <CarFront className="inline h-4 w-4 mr-2" />
                    {car.body_type}
                  </p>
                  <p>
                    <CarFront className="inline h-4 w-4 mr-2" />
                    {car.carbon_emissions} g/km CO2
                  </p>
                  <p>
                    <Users className="inline h-4 w-4 mr-2" />
                    {car.passenger_capacity} Passengers
                  </p>
                </div>

                <div className="space-y-2">
                  <p>
                    <CarFront className="inline h-4 w-4 mr-2" />
                    {car.transmission}
                  </p>
                  <p>
                    <Fuel className="inline h-4 w-4 mr-2" />
                    {car.fuel_type}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button className="whitespace-nowrap flex-1" onClick={onRentNow}>
            Rent Now <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
