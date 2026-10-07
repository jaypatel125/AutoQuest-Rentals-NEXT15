import { object, string, z } from "zod";
import { BODY_TYPES, FUEL_TYPES, TRANSMISSIONS } from "./vehicles";

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

export const getPasswordSchema = (type: "password" | "confirmPassword") =>
  string()
    .min(PASSWORD_MIN, {
      message: `${type === "password" ? "Password" : "Confirmation"} must be at least ${PASSWORD_MIN} characters`,
    })
    .max(PASSWORD_MAX, {
      message: `${type === "password" ? "Password" : "Confirmation"} cannot exceed ${PASSWORD_MAX} characters`,
    });

export const getEmailSchema = () =>
  string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Enter a valid email address" });

export const getNameSchema = () =>
  string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name must be less than 50 characters" });

// Sign-in only checks presence: older accounts may have shorter passwords.
export const signInSchema = object({
  email: getEmailSchema(),
  password: string().min(1, { message: "Password is required" }),
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

const IMAGE_PATH = /^\/api\/images\/[0-9a-f-]{36}$/i;

/** A stored photo path, an external https URL, or no photo. */
export const vehicleImageSchema = z.union([
  z.string().regex(IMAGE_PATH),
  z.string().url().startsWith("https://"),
  z.null(),
]);

/** Server-side validation for vehicle create/update payloads. */
export const vehicleSchema = z.object({
  branch_id: z.string().trim().min(1, "Branch is required").max(64),
  brand: z.string().trim().min(1, "Brand is required").max(60),
  model: z.string().trim().min(1, "Model is required").max(60),
  transmission: z.enum(TRANSMISSIONS as [string, ...string[]]),
  fuel_type: z.enum(FUEL_TYPES as [string, ...string[]]),
  passenger_capacity: z.coerce.number().int().min(1).max(15),
  body_type: z.enum(BODY_TYPES as [string, ...string[]]),
  carbon_emissions: z.coerce.number().min(0).max(1000),
  price_per_day: z.coerce
    .number()
    .positive("Price must be greater than 0")
    .max(10000),
  available: z.boolean(),
  image: vehicleImageSchema.optional(),
});

export const vehicleUpdateSchema = vehicleSchema.partial();

export const branchSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  address: z.string().trim().min(1, "Address is required").max(200),
  city: z.string().trim().min(1, "City is required").max(100),
  province: z.string().trim().min(1, "Province is required").max(100),
  postal_code: z.string().trim().min(3, "Postal code is required").max(12),
});

export const branchUpdateSchema = branchSchema.partial();

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: getEmailSchema().max(200),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message is too long"),
  // Honeypot: real users never see or fill this field.
  website: z.string().max(0).optional().or(z.literal("")),
});
