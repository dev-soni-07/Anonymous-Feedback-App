// Zod: TypeScript first Schema Validation before going to Mongoose

import { z } from "zod";

export const usernameValidation = z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(25, "Username must be at most 25 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username must only contain alphanumeric characters and underscores");

export const signUpSchema = z.object(
    {
        username: usernameValidation,
        email: z.string().email({ message: "Invalid email address" }),
        password: z.string().min(8, "Password must be at least 8 characters"),
    }
);