"use client";

import { useEffect, useState } from "react";
import MaxWidthWrapper from "@/components/utility/MaxWidthWrapper";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star, Users, Fuel, Car, CarFront } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { Car as CarType } from "../../lib/database/table-types";
import { SearchBar } from "@/components/select-vehicle/search-bar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSearchStore } from "@/lib/store/searchStore";
import { useCars } from "@/hooks/useCars";
import { is } from "date-fns/locale";

const filters = [
  {
    title: "Vehicle Brand",
    options: ["Audi", "Tesla"],
  },
  {
    title: "Vehicle Type",
    options: ["Hatchbacks", "SUVs", "Trucks", "Vans", "Sedans"],
  },
  {
    title: "Number of Passengers",
    options: ["2+", "4+", "6+"],
  },
  {
    title: "Fuel Type",
    options: ["Gasoline", "Diesel", "Electric"],
  },
];

export default function SelectVehiclePage() {
  const { city, startDate, endDate } = useSearchStore();
  const { data: cars, isLoading, error } = useCars();

  if (error) {
    return <div>Error loading cars: {error.message}</div>;
  }

  return (
    <MaxWidthWrapper>
      <SearchBar />

      <div className="grid md:grid-cols-5 gap-6">
        <aside className="md:col-span-1 space-y-6">
          {(city || startDate || endDate) && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Search Results For:</h3>
              <div className="flex flex-wrap gap-2">
                {city && (
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                    Location: {city}
                  </span>
                )}
                {startDate && (
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                    Pickup: {new Date(startDate).toLocaleDateString()}
                  </span>
                )}
                {endDate && (
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                    Return: {new Date(endDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )}
          {filters.map((filter, idx) => (
            <Card key={idx}>
              <CardHeader className="font-semibold text-sm">
                {filter.title}
              </CardHeader>
              <CardContent className="space-y-2">
                {filter.options.map((opt, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Checkbox id={`${filter.title}-${i}`} />
                    <Label htmlFor={`${filter.title}-${i}`}>{opt}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </aside>

        <div className="grid md:grid-cols-4 gap-6 col-span-4">
          {isLoading ? (
            <div className="col-span-4 text-center py-12">Loading cars...</div>
          ) : cars!.length > 0 ? (
            cars!.map((car) => (
              <Link
                key={car.id}
                href={`/select-vehicle/${car.id}`}
                className="block"
              >
                <Card className="hover:shadow-md h-fit cursor-pointer transition">
                  <CardContent className="p-4">
                    <Image
                      src={car.images || "/car-placeholder.png"}
                      alt={`${car.brand} ${car.model}`}
                      width={400}
                      height={200}
                      className="rounded-md mb-3"
                    />
                    <h3 className="font-semibold mb-2">
                      {car.brand} {car.model}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Star
                        fill="orange"
                        className="h-4 w-4 text-yellow-500 mr-1"
                      />
                      4.8 (2,436 reviews)
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                      <li>
                        <Users className="inline h-4 w-4 mr-1" />{" "}
                        {car.passengerCapacity} Passengers
                      </li>
                      <li>
                        <Car className="inline h-4 w-4 mr-1" />{" "}
                        {car.transmission}
                      </li>
                      <li>
                        <Fuel className="inline h-4 w-4 mr-1" /> {car.fuelType}
                      </li>
                      <li>
                        <CarFront className="inline h-4 w-4 mr-2" />
                        {car.bodyType}
                      </li>
                    </ul>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        ${car.pricePerDay}/day
                      </span>
                      <Button variant="outline" size="sm">
                        Rent Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria to find more options.
              </p>
            </div>
          )}
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
