import z from "zod";

// This schema is used to validate the user verification data

export const verifySchema = z.object({
    email: z.string().email({ message: "Invalid email address" }).trim(),
    verifycode: z.string().length(6, "Verification code must be exactly 6 characters long").trim(),
});