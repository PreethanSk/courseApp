import {z} from "zod";

export const zodSignup = z.object({
    username: z.string().min(4),
    password: z.string().min(5).max(15)
})

export const courseCreateZod = z.object({
    name: z.string().max(15),
    description: z.string().max(200),
    price: z.number().int(),
    courseContent: z.string()
})

export const updateCourseZod = z.object({
    id: z.number(),
    name: z.string().max(15),
    description: z.string().max(200),
    price: z.number().int(),
    courseContent: z.string()
})