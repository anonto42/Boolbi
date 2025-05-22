import { z } from "zod";

const getChatRroom = z.object({
    query: z.object({
        chatID: z.string({required_error: "You must give the chat id to get the chat id"})
    })
})

const createChatRoom = z.object({
    body: z.object({
        image: z.string(),
        chatName: z.string({ required_error: "you must give a chat name"},),
        receiver: z.string({required_error: "You must give the second person of the user that you want to chat"})
    })
})

const deleteRoom = z.object({
    query: z.object({
        chatID: z.string().optional()
    })
})


export const MessageValidation = {
    getChatRroom,
    createChatRoom,
    deleteRoom
}