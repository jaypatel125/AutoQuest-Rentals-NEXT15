"use client";

import { Branches, Cars } from "@/lib/database/table-types";
import { IUser } from "../../../auth-client";

export const handleCheckout = async (
  currentUser: IUser,
  selectedCar: Cars,
  startDate: Date | null,
  endDate: Date | null,
  branch: Branches
) => {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentUser,
        selectedCar,
        startDate,
        endDate,
        branch,
      }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
