import z from "zod";

// This schema is used to validate   

export const acceptMessageSchema = z.object({
   acceptMessage: z.boolean(),
});