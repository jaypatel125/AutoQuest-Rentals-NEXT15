"use client";

import { CustomersItem } from "@/app/api/admin/all-users/route";

export type CustomersPage = {
  customers: CustomersItem[];
  nextCursor: string | null;
};

export const adminCustomersKeys = {
  all: ["admin-customers"] as const,
  list: (q: string) => ["admin-customers", q] as const,
};

// Utility function to handle fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number }
) {
  const { timeout = 15000, signal, ...rest } = options;
  const controller = new AbortController();

  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...rest,
      credentials: "include",
      signal: signal ?? controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function fetchAdminCustomersPage({
  cursor,
  limit = 20,
  q,
  signal,
}: {
  cursor?: string | null;
  limit?: number;
  q?: string;
  signal?: AbortSignal;
}): Promise<CustomersPage> {
  const params = new URLSearchParams();
  if (cursor) params.append("cursor", cursor);
  if (limit) params.append("limit", limit.toString());
  if (q) params.append("q", q);

  try {
    const res = await fetchWithTimeout(
      `/api/admin/all-users?${params.toString()}`,
      { method: "GET", signal, timeout: 15000 }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const message = data.error || data.message || res.statusText;
      throw new Error(`[${res.status}] Failed to fetch customers: ${message}`);
    }

    return (await res.json()) as CustomersPage;
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Unknown error while fetching customers";
    throw new Error(`Failed to fetch customers: ${message}`);
  }
}
