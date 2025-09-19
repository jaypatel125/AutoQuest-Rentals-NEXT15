import { useQuery } from "@tanstack/react-query";
import { Car as CarType } from "@/lib/database/table-types";
import { useSearchStore } from "@/lib/store/searchStore";

// Helper function to safely convert to Date object
function safeToDate(date: any): Date | undefined {
  if (!date) return undefined;
  if (date instanceof Date) return date;
  try {
    return new Date(date);
  } catch {
    return undefined;
  }
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

  const res = await fetch("/api/cars", {
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

export function useCars() {
  const { city, startDate, endDate } = useSearchStore();

  const startDateObj = safeToDate(startDate);
  const endDateObj = safeToDate(endDate);

  const startDateKey = startDateObj?.toISOString() || null;
  const endDateKey = endDateObj?.toISOString() || null;

  return useQuery({
    queryKey: ["cars", city, startDateKey, endDateKey],
    queryFn: () => fetchCars(city, startDateObj, endDateObj),
    enabled: !!city && !!startDateObj && !!endDateObj,
  });
}
