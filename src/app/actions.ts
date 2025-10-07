"use server";
import { neon } from "@neondatabase/serverless";

export async function getData() {
  const sql = neon(process.env.DATABASE_URL!);
  const data = await sql`...`;
  return data;
}

export async function fetchCarBrands() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/vehicles/get-brands`
  );
  const data = await response.json();
  return data;
}
export async function fetchCarBodyTypes() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/vehicles/get-body-types`
  );
  const data = await response.json();
  return data;
}
