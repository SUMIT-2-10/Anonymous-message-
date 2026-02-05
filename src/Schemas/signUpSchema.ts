import z from "zod"
//these is schema is used to validate the user sign up data
export const usernameValidation = z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username must be at most 30 characters long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .trim()

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({ message: "Invalid email address" }).trim(),
    password: z.string()
        .min(8, "Password must be at least 8 characters long")

})