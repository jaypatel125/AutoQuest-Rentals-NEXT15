"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CalendarDays,
  CarFront,
  MapPin,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toDate, useSearchStore } from "@/context/searchStore";
import { EVPromotionDialog } from "@/components/main/select-vehicle/EVPromotionDialog";
import { fetchCars } from "@/app/(main)/select-vehicle/actions";
import { SearchBar } from "../searchbar";
import MaxWidthWrapper from "@/components/utility/MaxWidthWrapper";
import Error from "@/components/utility/Error";
import { EmptyState } from "@/components/utility/EmptyState";
import {
  CarListing,
  VehicleCard,
  VehicleCardSkeleton,
} from "@/components/vehicles/VehicleCard";
import { bodyTypeLabel } from "@/lib/vehicles";
import { rentalDays } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";

interface FilterState {
  brands: string[];
  fuelTypes: string[];
  transmissions: string[];
  bodyTypes: string[];
  passengerCapacities: number[];
}

type SortKey = "price-asc" | "price-desc" | "green" | "seats";

const EMPTY_FILTERS: FilterState = {
  brands: [],
  fuelTypes: [],
  transmissions: [],
  bodyTypes: [],
  passengerCapacities: [],
};

const FILTER_LABELS: Record<keyof FilterState, string> = {
  fuelTypes: "Fuel type",
  bodyTypes: "Body type",
  brands: "Brand",
  transmissions: "Transmission",
  passengerCapacities: "Seats",
};

const FILTER_ORDER: (keyof FilterState)[] = [
  "fuelTypes",
  "bodyTypes",
  "brands",
  "transmissions",
  "passengerCapacities",
];

function parseFiltersFromParams(params: URLSearchParams | null): FilterState {
  if (!params) return EMPTY_FILTERS;
  const list = (key: string) =>
    params.get(key)?.split(",").filter(Boolean) || [];
  return {
    brands: list("brands"),
    fuelTypes: list("fuelTypes"),
    transmissions: list("transmissions"),
    bodyTypes: list("bodyTypes"),
    passengerCapacities: list("passengerCapacities")
      .map(Number)
      .filter((n) => !isNaN(n)),
  };
}

function toQueryString(
  filters: FilterState,
  sort: SortKey,
  maxPrice: number | null
) {
  const params = new URLSearchParams();
  for (const key of FILTER_ORDER) {
    if (filters[key].length) params.set(key, filters[key].join(","));
  }
  if (sort !== "price-asc") params.set("sort", sort);
  if (maxPrice) params.set("maxPrice", String(maxPrice));
  return params.toString();
}

function optionLabel(key: keyof FilterState, value: string | number) {
  if (key === "passengerCapacities") return `${value} seats`;
  if (key === "bodyTypes") return bodyTypeLabel(String(value));
  return String(value);
}

export default function SelectVehiclePage() {
  const { branch, startDate, endDate, setSelectedCar } = useSearchStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const [selectedFilters, setSelectedFilters] = useState<FilterState>(() =>
    parseFiltersFromParams(searchParams as unknown as URLSearchParams)
  );
  const [sort, setSort] = useState<SortKey>(
    () => (searchParams?.get("sort") as SortKey) || "price-asc"
  );
  const [maxPrice, setMaxPrice] = useState<number | null>(() => {
    const v = Number(searchParams?.get("maxPrice"));
    return Number.isFinite(v) && v > 0 ? v : null;
  });

  const start = toDate(startDate);
  const end = toDate(endDate);
  const city = branch?.city || "";
  const hasTrip = !!city && !!start && !!end;

  const {
    data: cars = [],
    isLoading,
    error,
    refetch,
  } = useQuery<CarListing[]>({
    queryKey: ["cars", city, start?.toISOString(), end?.toISOString()],
    queryFn: () => fetchCars(city, start, end),
  });

  // Keep filters in the URL so results can be shared and survive reloads.
  useEffect(() => {
    const next = toQueryString(selectedFilters, sort, maxPrice);
    if (next !== (searchParams?.toString() || "")) {
      router.replace(next ? `/select-vehicle?${next}` : "/select-vehicle", {
        scroll: false,
      });
    }
  }, [selectedFilters, sort, maxPrice, router, searchParams]);

  const availableFilters = useMemo(() => {
    const distinct = <T,>(arr: T[]) => Array.from(new Set(arr)).filter(Boolean);
    return {
      fuelTypes: distinct(cars.map((c) => c.fuel_type as string)),
      bodyTypes: distinct(cars.map((c) => c.body_type as string)),
      brands: distinct(cars.map((c) => c.brand)).sort(),
      transmissions: distinct(cars.map((c) => c.transmission as string)),
      passengerCapacities: distinct(cars.map((c) => c.passenger_capacity)).sort(
        (a, b) => a - b
      ),
    } as Record<keyof FilterState, (string | number)[]>;
  }, [cars]);

  const priceCeiling = useMemo(
    () =>
      Math.ceil(Math.max(0, ...cars.map((c) => Number(c.price_per_day))) / 10) *
      10,
    [cars]
  );

  const filteredCars = useMemo(() => {
    const f = selectedFilters;
    const list = cars.filter((car) => {
      if (f.brands.length && !f.brands.includes(car.brand)) return false;
      if (f.fuelTypes.length && !f.fuelTypes.includes(car.fuel_type!))
        return false;
      if (
        f.transmissions.length &&
        !f.transmissions.includes(car.transmission!)
      )
        return false;
      if (f.bodyTypes.length && !f.bodyTypes.includes(car.body_type!))
        return false;
      if (
        f.passengerCapacities.length &&
        !f.passengerCapacities.includes(car.passenger_capacity!)
      )
        return false;
      if (maxPrice && Number(car.price_per_day) > maxPrice) return false;
      return true;
    });
    const price = (c: CarListing) => Number(c.price_per_day);
    return [...list].sort((a, b) => {
      switch (sort) {
        case "price-desc":
          return price(b) - price(a);
        case "green":
          return (
            Number(a.carbon_emissions) - Number(b.carbon_emissions) ||
            price(a) - price(b)
          );
        case "seats":
          return (
            b.passenger_capacity - a.passenger_capacity || price(a) - price(b)
          );
        default:
          return price(a) - price(b);
      }
    });
  }, [cars, selectedFilters, sort, maxPrice]);

  const handleFilterChange = (
    category: keyof FilterState,
    value: string | number,
    checked: boolean
  ) => {
    setSelectedFilters((prev) => {
      const current = [...prev[category]] as (string | number)[];
      return {
        ...prev,
        [category]: checked
          ? [...current, value]
          : current.filter((v) => v !== value),
      };
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters(EMPTY_FILTERS);
    setMaxPrice(null);
  };

  const activeChips = FILTER_ORDER.flatMap((key) =>
    (selectedFilters[key] as (string | number)[]).map((value) => ({
      key,
      value,
    }))
  );
  const hasActiveFilters = activeChips.length > 0 || !!maxPrice;

  const handleRent = (car: CarListing) => {
    setSelectedCar(car);
    if (!hasTrip) {
      router.push(`/select-vehicle/${car.id}`);
      return;
    }
    if (car.fuel_type === "Electric") {
      router.push(`/checkout`);
      return;
    }
    setDialogOpen(true);
  };

  const filterPanel = (idPrefix: string) => (
    <div className="space-y-6">
      {cars.length > 0 && priceCeiling > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Max price per day</h4>
            <span className="text-sm font-semibold text-primary">
              {maxPrice ? formatPrice(maxPrice) : "Any"}
            </span>
          </div>
          <input
            type="range"
            aria-label="Maximum price per day"
            min={10}
            max={priceCeiling}
            step={5}
            value={maxPrice ?? priceCeiling}
            onChange={(e) => {
              const v = Number(e.target.value);
              setMaxPrice(v >= priceCeiling ? null : v);
            }}
            className="w-full"
          />
        </div>
      )}
      {FILTER_ORDER.map((key) =>
        availableFilters[key].length ? (
          <div
            key={key}
            className="space-y-3 border-t pt-5 first:border-t-0 first:pt-0"
          >
            <h4 className="text-sm font-semibold">{FILTER_LABELS[key]}</h4>
            <div className="space-y-2.5">
              {availableFilters[key].map((opt) => {
                const id = `${idPrefix}-${key}-${opt}`;
                return (
                  <div key={String(opt)} className="flex items-center gap-2.5">
                    <Checkbox
                      id={id}
                      checked={(
                        selectedFilters[key] as (string | number)[]
                      ).includes(opt)}
                      onCheckedChange={(checked) =>
                        handleFilterChange(key, opt, checked === true)
                      }
                    />
                    <Label htmlFor={id} className="cursor-pointer font-normal">
                      {optionLabel(key, opt)}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null
      )}
    </div>
  );

  return (
    <div className="pb-20">
      <div className="border-b bg-muted/40">
        <MaxWidthWrapper className="space-y-5 py-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold md:text-4xl">
              {city ? `Cars in ${city}` : "Browse cars"}
            </h1>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
              {hasTrip ? (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-4" />
                    {format(start!, "EEE, MMM d")} to{" "}
                    {format(end!, "EEE, MMM d")}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4" />
                    {rentalDays(start!, end!)} day trip
                  </span>
                </>
              ) : (
                <span>Select a location and date range to get started.</span>
              )}
            </p>
          </div>
          <SearchBar onSearch={() => undefined} />
        </MaxWidthWrapper>
      </div>

      <MaxWidthWrapper className="mt-8 flex flex-col gap-8 lg:flex-row">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border bg-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-semibold">Filters</h3>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="cursor-pointer text-sm font-medium text-primary hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
            {filterPanel("desktop")}
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {isLoading ? (
                "Finding cars..."
              ) : (
                <>
                  <strong className="text-foreground">
                    {filteredCars.length}
                  </strong>{" "}
                  {filteredCars.length === 1 ? "car" : "cars"}
                  {hasTrip ? " available for your dates" : ""}
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal /> Filters
                    {activeChips.length > 0 && (
                      <span className="rounded-full bg-primary px-1.5 text-[11px] text-primary-foreground">
                        {activeChips.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[85%] max-w-sm overflow-y-auto p-6"
                >
                  <SheetHeader className="px-0">
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  {filterPanel("mobile")}
                </SheetContent>
              </Sheet>
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger
                  className="h-8 w-[190px] rounded-lg text-[13px]"
                  aria-label="Sort by"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="price-asc">Price: low to high</SelectItem>
                  <SelectItem value="price-desc">Price: high to low</SelectItem>
                  <SelectItem value="green">Greenest first</SelectItem>
                  <SelectItem value="seats">Most seats</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {activeChips.map(({ key, value }) => (
                <button
                  key={`${key}-${value}`}
                  type="button"
                  onClick={() => handleFilterChange(key, value, false)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground hover:bg-accent/70"
                >
                  {optionLabel(key, value)} <X className="size-3.5" />
                </button>
              ))}
              {maxPrice && (
                <button
                  type="button"
                  onClick={() => setMaxPrice(null)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground hover:bg-accent/70"
                >
                  Under {formatPrice(maxPrice)}/day <X className="size-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={clearAllFilters}
                className="cursor-pointer px-2 text-sm font-medium text-muted-foreground hover:text-foreground lg:hidden"
              >
                Clear Filters
              </button>
            </div>
          )}

          {!hasTrip && (
            <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-accent/50 px-4 py-3 text-sm text-accent-foreground">
              <CalendarDays className="size-5 shrink-0" />
              Add a location and dates above to check availability and see trip
              totals.
            </div>
          )}

          {error ? (
            <Error
              error={(error as Error).message || "Failed to load vehicles."}
              onRetry={() => refetch()}
            />
          ) : isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <VehicleCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredCars.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCars.map((car, i) => (
                <VehicleCard
                  key={car.id}
                  car={car}
                  start={hasTrip ? start : undefined}
                  end={hasTrip ? end : undefined}
                  onRent={handleRent}
                  priority={i < 3}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CarFront}
              title="No vehicles found"
              description={
                hasActiveFilters
                  ? "Try adjusting your filters to find more options."
                  : "Try adjusting your search criteria to find more options."
              }
              action={
                hasActiveFilters ? (
                  <Button onClick={clearAllFilters}>Clear All Filters</Button>
                ) : undefined
              }
            />
          )}
        </div>
      </MaxWidthWrapper>

      <EVPromotionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCheckoutEV={() => {
          setSelectedFilters((prev) => ({ ...prev, fuelTypes: ["Electric"] }));
          setDialogOpen(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onContinue={() => {
          setDialogOpen(false);
          router.push("/checkout");
        }}
      />
    </div>
  );
}
