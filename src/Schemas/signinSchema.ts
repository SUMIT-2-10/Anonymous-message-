import z from "zod";

// This schema is used to validate the user sign-in data    

export const signInSchema = z.object({
    identifier: z.string(),//can use email instead of idenatifier
    password: z.string(),
});