import { z } from "zod";

const getChatRroom = z.object({
    query: z.object({
        chatID: z.string().optional()
    })
})

export const MessageValidation = {
    getChatRroom
}