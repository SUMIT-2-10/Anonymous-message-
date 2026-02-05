import z from "zod";

// This schema is used to validate   

export const messageSchema = z.object({
    content: z
        .string()
        .min(10, "Content cannot be empty ")
        .max(1000, "Content is too long"),
});