import { z } from "zod"


const userUpdateSchema = z.object({
    query: z.object({
        acction: z.enum(["ACTIVE", "BLOCK", "DELETE", "REPORT"]),
        user: z.string({required_error:"You must give the user id for change user account status"})
    })
})

export const AdminValidation = {
    userUpdateSchema
}