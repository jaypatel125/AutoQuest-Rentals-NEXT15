"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Users, Fuel, Car, CarFront, FilterX } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "@/components/select-vehicle/Seachbar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSearchStore } from "@/lib/store/searchStore";
import { Car as CarType } from "@/lib/database/table-types";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect, useRef } from "react";
import { EVPromotionDialog } from "@/components/select-vehicle/EVPromotionDialog";
import { useRouter, useSearchParams } from "next/navigation";

export interface CarFilters {
  brands: string[];
  fuelTypes: string[];
  transmissions: string[];
  bodyTypes: string[];
  passengerCapacities: number[];
}

interface FilterState {
  brands: string[];
  fuelTypes: string[];
  transmissions: string[];
  bodyTypes: string[];
  passengerCapacities: number[];
}

async function fetchCars(
  city?: string,
  startDate?: Date,
  endDate?: Date
): Promise<CarType[]> {
  const payload = {
    city,
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
  };

  const res = await fetch("/api/vehicles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch cars");
  }

  return res.json();
}

function safeToDate(
  date: string | number | Date | undefined
): Date | undefined {
  if (!date) return undefined;
  if (date instanceof Date) return date;
  try {
    return new Date(date);
  } catch {
    return undefined;
  }
}

function parseFiltersFromParams(params: URLSearchParams | null): FilterState {
  if (!params) {
    return {
      brands: [],
      fuelTypes: [],
      transmissions: [],
      bodyTypes: [],
      passengerCapacities: [],
    };
  }

  return {
    brands: params.get("brands")?.split(",").filter(Boolean) || [],
    fuelTypes: params.get("fuelTypes")?.split(",").filter(Boolean) || [],
    transmissions:
      params.get("transmissions")?.split(",").filter(Boolean) || [],
    bodyTypes: params.get("bodyTypes")?.split(",").filter(Boolean) || [],
    passengerCapacities:
      params
        .get("passengerCapacities")
        ?.split(",")
        .map(Number)
        .filter((n) => !isNaN(n)) || [],
  };
}

function filtersToQueryString(filters: FilterState): string {
  const params = new URLSearchParams();
  if (filters.brands.length > 0) params.set("brands", filters.brands.join(","));
  if (filters.fuelTypes.length > 0)
    params.set("fuelTypes", filters.fuelTypes.join(","));
  if (filters.transmissions.length > 0)
    params.set("transmissions", filters.transmissions.join(","));
  if (filters.bodyTypes.length > 0)
    params.set("bodyTypes", filters.bodyTypes.join(","));
  if (filters.passengerCapacities.length > 0)
    params.set("passengerCapacities", filters.passengerCapacities.join(","));
  return params.toString();
}

export default function ClientSelectVehiclePage() {
  const { city, startDate, endDate } = useSearchStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse initial filters from URL only once on component mount
  const [selectedFilters, setSelectedFilters] = useState<FilterState>(() =>
    parseFiltersFromParams(searchParams as unknown as URLSearchParams)
  );

  const startDateObj = safeToDate(startDate);
  const endDateObj = safeToDate(endDate);

  const startDateKey = startDateObj?.toISOString() || null;
  const endDateKey = endDateObj?.toISOString() || null;

  const {
    data: cars = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cars", city, startDateKey, endDateKey],
    queryFn: () => fetchCars(city, startDateObj, endDateObj),
    enabled: !!city && !!startDateObj && !!endDateObj,
  });

  useEffect(() => {
    const queryString = filtersToQueryString(selectedFilters);
    const currentQueryString = searchParams?.toString() || "";

    if (queryString !== currentQueryString) {
      const newUrl = queryString
        ? `/select-vehicle?${queryString}`
        : "/select-vehicle";
      router.push(newUrl, { scroll: false });
    }
  }, [selectedFilters, router, searchParams]);

  useEffect(() => {
    if (!searchParams?.toString()) {
      clearAllFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, startDate, endDate, searchParams?.toString()]);

  const availableFilters = useMemo(() => {
    if (!cars.length) return null;

    const distinct = <T,>(arr: T[]) => Array.from(new Set(arr)).filter(Boolean);

    return {
      brands: distinct(cars.map((c) => c.brand)),
      fuelTypes: distinct(cars.map((c) => c.fuelType)),
      transmissions: distinct(cars.map((c) => c.transmission)),
      bodyTypes: distinct(cars.map((c) => c.bodyType)),
      passengerCapacities: distinct(cars.map((c) => c.passengerCapacity)).sort(
        (a, b) => a - b
      ),
    };
  }, [cars]);

  const filteredCars = useMemo(() => {
    if (!cars.length) return [];

    return cars.filter((car) => {
      if (
        selectedFilters.brands.length > 0 &&
        !selectedFilters.brands.includes(car.brand)
      )
        return false;

      if (
        selectedFilters.fuelTypes.length > 0 &&
        !selectedFilters.fuelTypes.includes(car.fuelType)
      )
        return false;

      if (
        selectedFilters.transmissions.length > 0 &&
        !selectedFilters.transmissions.includes(car.transmission)
      )
        return false;

      if (
        selectedFilters.bodyTypes.length > 0 &&
        !selectedFilters.bodyTypes.includes(car.bodyType)
      )
        return false;

      if (
        selectedFilters.passengerCapacities.length > 0 &&
        !selectedFilters.passengerCapacities.includes(car.passengerCapacity)
      )
        return false;

      return true;
    });
  }, [cars, selectedFilters]);

  const handleFilterChange = (
    category: keyof FilterState,
    value: string | number,
    checked: boolean
  ) => {
    setSelectedFilters((prev) => {
      const currentValues = [...prev[category]];

      if (checked) {
        return {
          ...prev,
          [category]: [...currentValues, value],
        };
      } else {
        return {
          ...prev,
          [category]: currentValues.filter((v) => v !== value),
        };
      }
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      brands: [],
      fuelTypes: [],
      transmissions: [],
      bodyTypes: [],
      passengerCapacities: [],
    });
  };

  const hasActiveFilters = Object.values(selectedFilters).some(
    (filters) => filters.length > 0
  );

  if (error) {
    return <div>Error loading cars: {error.message}</div>;
  }

  const handleLocalCheckoutEV = () => {
    setSelectedFilters({
      ...selectedFilters,
      fuelTypes: ["Electric"],
    });
    setDialogOpen(false);
  };

  return (
    <div>
      <SearchBar />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <aside className="md:w-1/5 space-y-6">
          {(city || startDate || endDate || hasActiveFilters) && (
            <div className="px-6 py-4 space-y-2 bg-muted rounded-lg">
              <h3 className="font-semibold my-2">Search Results For:</h3>
              <Button
                variant="ghost"
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-sm"
              >
                <FilterX size={14} />
                Clear Filters
              </Button>
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

                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedFilters).map(([key, values]) =>
                      values.length > 0 ? (
                        <span
                          key={key}
                          className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm"
                        >
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                          : {values.join(", ")}
                        </span>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {availableFilters && (
            <div className="space-y-6">
              {Object.entries(availableFilters).map(([key, values]) => (
                <Card key={key} className="h-fit">
                  <CardHeader className="font-semibold text-sm">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {values.map((opt, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${key}-${i}`}
                          checked={selectedFilters[
                            key as keyof FilterState
                          ].includes(opt as never)}
                          onCheckedChange={(checked) =>
                            handleFilterChange(
                              key as keyof FilterState,
                              opt,
                              checked === true
                            )
                          }
                        />
                        <Label htmlFor={`${key}-${i}`}>
                          {opt} {key === "passengerCapacities" && "Passengers"}
                        </Label>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </aside>

        {/* Cars Grid */}
        <div className="md:w-4/5">
          {isLoading ? (
            <div className="text-center py-12">Loading cars...</div>
          ) : filteredCars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCars.map((car) => (
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

                      <ul className="text-sm text-muted-foreground space-y-1 mb-3">
                        <li>
                          <Users className="inline h-4 w-4 mr-1" />{" "}
                          {car.passengerCapacity} Passengers
                        </li>
                        <li>
                          <Car className="inline h-4 w-4 mr-1" />{" "}
                          {car.transmission}
                        </li>
                        <li>
                          <Fuel className="inline h-4 w-4 mr-1" />{" "}
                          {car.fuelType}
                        </li>
                        <li>
                          <CarFront className="inline h-4 w-4 mr-2" />
                          {car.bodyType}
                        </li>
                      </ul>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-lg">
                          ${car.pricePerDay}
                          <span className="text-sm font-normal">/day</span>
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="whitespace-nowrap"
                          onClick={(e) => {
                            e.preventDefault();
                            if (car.fuelType === "Electric") {
                              router.push(`/checkout`);
                            }
                            setDialogOpen(true);
                            useSearchStore.getState().setSelectedCar(car);
                          }}
                        >
                          Rent Now →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? "Try adjusting your filters to find more options."
                  : "Try adjusting your search criteria to find more options."}
              </p>
              {hasActiveFilters && (
                <Button onClick={clearAllFilters}>Clear All Filters</Button>
              )}
            </div>
          )}
        </div>
      </div>

      <EVPromotionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCheckoutEV={handleLocalCheckoutEV}
        onContinue={() => {
          setDialogOpen(false);
          router.push("/checkout");
        }}
        carbonSaved={4.7}
        rewards={47}
      />
    </div>
  );
}
