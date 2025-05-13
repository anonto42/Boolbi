import { z } from "zod"


const userUpdateSchema = z.object({
    query: z.object({
        acction: z.enum(["ACTIVE", "BLOCK", "DELETE", "REPORT"]),
        user: z.string({required_error:"You must give the user id for change user account status"})
    })
})

const catagorySchema = z.object({
    body: z.object({
        catagory: z.string({required_error:"You must give the catagory name"}),
        subCatagory: z.string({required_error:"You must give the a sub catagory"})
    })
})

export const AdminValidation = {
    userUpdateSchema,
    catagorySchema
}