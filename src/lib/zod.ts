import { object, string } from "zod";

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
