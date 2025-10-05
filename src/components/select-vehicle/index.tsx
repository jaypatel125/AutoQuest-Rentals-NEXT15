"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Fuel, Car, CarFront, FilterX, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "@/components/Seachbar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSearchStore } from "@/lib/store/searchStore";
import { Cars as CarType } from "@/lib/database/table-types";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { EVPromotionDialog } from "@/components/select-vehicle/EVPromotionDialog";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "@/components/utility/Loader";
import { useFormatPrice } from "@/lib/utils";
import { fetchCars } from "@/app/select-vehicle/actions";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
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

interface FilterState {
  brands: string[];
  fuelTypes: string[];
  transmissions: string[];
  bodyTypes: string[];
  passengerCapacities: number[];
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

export default function SelectVehiclePage() {
  const { branch, startDate, endDate } = useSearchStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { formatPrice } = useFormatPrice();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse initial filters from URL only once
  const [selectedFilters, setSelectedFilters] = useState<FilterState>(() =>
    parseFiltersFromParams(searchParams as unknown as URLSearchParams)
  );

  const startDateObj = safeToDate(startDate);
  const endDateObj = safeToDate(endDate);

  const city = branch?.city || "";

  const {
    data: cars = [],
    isLoading,
    error,
  } = useQuery<CarType[]>({
    queryKey: [
      "cars",
      city,
      startDateObj?.toISOString(),
      endDateObj?.toISOString(),
    ],
    queryFn: () => fetchCars(city, startDateObj, endDateObj),
    enabled: !!city && !!startDateObj && !!endDateObj,
  });

  // Sync filters with URL
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
  }, [city, startDate, endDate, searchParams]);

  const availableFilters = useMemo(() => {
    if (!cars.length) return null;
    const distinct = <T,>(arr: T[]) => Array.from(new Set(arr)).filter(Boolean);

    return {
      brands: distinct(cars.map((c) => c.brand)),
      fuelTypes: distinct(cars.map((c) => c.fuel_type)),
      transmissions: distinct(cars.map((c) => c.transmission)),
      bodyTypes: distinct(cars.map((c) => c.body_type)),
      passengerCapacities: distinct(
        cars.map((c) => c.passenger_capacity!)
      ).sort((a, b) => a - b),
    };
  }, [cars]);

  const filteredCars = useMemo(() => {
    if (!cars.length) return [];
    return cars.filter((car) => {
      if (
        selectedFilters.brands.length &&
        !selectedFilters.brands.includes(car.brand)
      )
        return false;
      if (
        selectedFilters.fuelTypes.length &&
        !selectedFilters.fuelTypes.includes(car.fuel_type!)
      )
        return false;
      if (
        selectedFilters.transmissions.length &&
        !selectedFilters.transmissions.includes(car.transmission!)
      )
        return false;
      if (
        selectedFilters.bodyTypes.length &&
        !selectedFilters.bodyTypes.includes(car.body_type!)
      )
        return false;
      if (
        selectedFilters.passengerCapacities.length &&
        !selectedFilters.passengerCapacities.includes(car.passenger_capacity!)
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
      return {
        ...prev,
        [category]: checked
          ? [...currentValues, value]
          : currentValues.filter((v) => v !== value),
      };
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

  if (error) return <div>Error loading cars: {(error as Error).message}</div>;

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
        {!city || !startDate || !endDate ? (
          <div className="w-full h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-muted-foreground">
                Select a location and date range to get started.
              </h3>
            </div>
          </div>
        ) : (
          <>
            {/* Filters Sidebar */}
            <aside className="md:w-1/5 space-y-6">
              {/* Active filters summary */}
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
                    {hasActiveFilters &&
                      Object.entries(selectedFilters).map(([key, values]) =>
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
                </div>
              )}

              {/* Filters UI */}
              {availableFilters && (
                <Card className="hidden md:block">
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(availableFilters).map(
                        ([key, values], idx) => (
                          <div key={key} className="space-y-4">
                            <h4 className="font-semibold text-sm">
                              {key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                            </h4>
                            <div className="space-y-2">
                              {values.map((opt, i) => (
                                <div
                                  key={i}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`${key}-${i}`}
                                    checked={selectedFilters[
                                      key as keyof FilterState
                                    ].includes(opt as never)}
                                    onCheckedChange={(checked) =>
                                      handleFilterChange(
                                        key as keyof FilterState,
                                        opt!,
                                        checked === true
                                      )
                                    }
                                  />
                                  <Label htmlFor={`${key}-${i}`}>
                                    {opt}{" "}
                                    {key === "passengerCapacities" &&
                                      "Passengers"}
                                  </Label>
                                </div>
                              ))}
                            </div>
                            {/* Add separator between groups except last */}
                            {idx <
                              Object.entries(availableFilters).length - 1 && (
                              <Separator />
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              <div className="md:hidden mb-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[70%] sm:w-2/5 p-6">
                    <SheetHeader className="px-0 text-xl">
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <Separator />
                    <div className="space-y-4">
                      {availableFilters &&
                        Object.entries(availableFilters).map(
                          ([key, values], idx) => (
                            <div key={key} className="space-y-4 ">
                              <h4 className="font-semibold ">
                                {key
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                              </h4>
                              <div className="space-y-2 text-md">
                                {values.map((opt, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`mobile-${key}-${i}`}
                                      checked={selectedFilters[
                                        key as keyof FilterState
                                      ].includes(opt as never)}
                                      onCheckedChange={(checked) =>
                                        handleFilterChange(
                                          key as keyof FilterState,
                                          opt!,
                                          checked === true
                                        )
                                      }
                                    />
                                    <Label htmlFor={`mobile-${key}-${i}`}>
                                      {opt}{" "}
                                      {key === "passengerCapacities" &&
                                        "Passengers"}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                              {idx <
                                Object.entries(availableFilters).length - 1 && (
                                <Separator />
                              )}
                            </div>
                          )
                        )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </aside>

            {/* Cars Grid */}
            <div className="md:w-4/5">
              {isLoading ? (
                <div className="w-full h-[60vh] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader />
                    <h3 className="font-semibold text-xl">
                      Fetching available vehicles...
                    </h3>
                    <p>This won&apos;t take too long!</p>
                  </div>
                </div>
              ) : filteredCars.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCars.map((car) => (
                    <Link
                      key={car.id}
                      href={`/select-vehicle/${car.id}`}
                      className="block"
                    >
                      <Card className="hover:shadow-md cursor-pointer transition">
                        <CardContent className="px-4">
                          <Image
                            src={car.image || "/car-placeholder.png"}
                            alt={`${car.brand} ${car.model}`}
                            width={400}
                            height={200}
                            className="rounded-md mb-3 h-48 object-cover"
                          />
                          <h3 className="font-semibold mb-2">
                            {car.brand} {car.model}
                          </h3>
                          <ul className="text-sm text-muted-foreground space-y-1 mb-3">
                            <li>
                              <Users className="inline h-4 w-4 mr-1" />{" "}
                              {car.passenger_capacity} Passengers
                            </li>
                            <li>
                              <Car className="inline h-4 w-4 mr-1" />{" "}
                              {car.transmission}
                            </li>
                            <li>
                              <Fuel className="inline h-4 w-4 mr-1" />{" "}
                              {car.fuel_type}
                            </li>
                            <li>
                              <CarFront className="inline h-4 w-4 mr-2" />{" "}
                              {car.body_type}
                            </li>
                          </ul>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold">
                              {formatPrice(car.price_per_day)}/day
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="whitespace-nowrap"
                              onClick={(e) => {
                                e.preventDefault();

                                if (car.fuel_type === "Electric") {
                                  router.push(`/checkout`);
                                  return;
                                }

                                setDialogOpen(true);
                                useSearchStore.getState().setSelectedCar(car);
                              }}
                            >
                              Rent Now <ArrowRight className="ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">
                    No vehicles found
                  </h3>
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
          </>
        )}
      </div>

      {/* EV Promo */}
      <EVPromotionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCheckoutEV={handleLocalCheckoutEV}
        onContinue={() => {
          setDialogOpen(false);
          router.push("/checkout");
        }}
      />
    </div>
  );
}
