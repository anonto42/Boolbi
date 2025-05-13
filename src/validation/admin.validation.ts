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

const announcementSchema = z.object({
    body: z.object({
        title: z.string({required_error: "You must give the title of your announcements"}),
        descriptions: z.string({required_error:"You must give your announcement description"})
    })
})

const announceUpdate = z.object({
    body: z.object({
        id: z.string({required_error:"You must give the id to update the announcement"}),
        title: z.string().optional(),
        descriptions: z.string().optional()
    })
})

export const AdminValidation = {
    userUpdateSchema,
    catagorySchema,
    announcementSchema,
    announceUpdate
}