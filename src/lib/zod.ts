import { object, string, z } from "zod";

export const getPasswordSchema = (type: "password" | "confirmPassword") =>
  string()
    .min(4, { message: `${type} must be at least 4 characters` })
    .max(32, { message: `${type} cannot exceed 32 characters` });

export const getEmailSchema = () =>
  string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email" });

export const getNameSchema = () =>
  string()
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name must be less than 50 characters" });

export const signInSchema = object({
  email: getEmailSchema(),
  password: getPasswordSchema("password"),
});

export const signUpSchema = object({
  name: getNameSchema(),
  email: getEmailSchema(),
  password: getPasswordSchema("password"),
  confirmPassword: getPasswordSchema("confirmPassword"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const addVehicleSchema = z.object({
  branch_id: z.string().min(1, { message: "Branch is required" }),
  brand: z.string().min(1, { message: "Brand is required" }),
  model: z.string().min(1, { message: "Model is required" }),
  transmission: z.string().min(1, { message: "Transmission type is required" }),
  fuel_type: z.string().min(1, { message: "Fuel type is required" }),
  passenger_capacity: z
    .union([
      z.string().min(1, { message: "Passenger capacity is required" }),
      z.number().min(1, { message: "Passenger capacity is required" }),
    ])
    .transform((val) => Number(val)),
  body_type: z.string().min(1, { message: "Body type is required" }),
  carbon_emissions: z
    .union([
      z.string().min(1, { message: "Carbon emissions are required" }),
      z.number().min(1, { message: "Carbon emissions are required" }),
    ])
    .transform((val) => Number(val)),
  price_per_day: z
    .union([
      z.string().min(1, { message: "Price per day is required" }),
      z.number().min(1, { message: "Price per day is required" }),
    ])
    .transform((val) => Number(val)),
  available: z.boolean(),
  image: z.union([z.instanceof(File), z.string()]).optional(),
  imageUrl: z.string().optional(),
});
