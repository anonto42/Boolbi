import { z } from "zod";


const getChatRroom = z.object({
    quary: z.object({
        roomID: z.string({required_error:"You must give the room id"})
    })
})

export const MessageValidation = {
    getChatRroom
}