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

export type AdminSafeDeleteResponse = {
  ok: true;
  userId: string;
  action: "anonymized_and_banned_permanently";
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
      `${
        process.env.NEXT_PUBLIC_APP_URL
      }/api/admin/all-users?${params.toString()}`,
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

export async function adminSafeDeleteUser({
  userId,
  anonymize = true,
  banReason = "Admin-initiated deactivation",
  signal,
}: {
  userId: string;
  anonymize?: boolean;
  banReason?: string | null;
  signal?: AbortSignal;
}): Promise<AdminSafeDeleteResponse> {
  try {
    const res = await fetchWithTimeout(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/delete-user`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, anonymize, banReason }),
        signal,
        timeout: 15000,
      }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const message = data.error || data.message || res.statusText;
      throw new Error(`[${res.status}] Failed to delete user: ${message}`);
    }

    return (await res.json()) as AdminSafeDeleteResponse;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error while deleting user";
    throw new Error(`Failed to delete user: ${message}`);
  }
}
