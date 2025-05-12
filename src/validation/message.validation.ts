import { z } from "zod";


const getChatRroom = z.object({
    quary: z.object({
        roomID: z.string({required_error:"You must give the room id"}),
        postID: z.string({required_error:"You must give the room id"}),
    })
})

const sendMessageSchema = z.object({
    body: z.object({
        message: z.string().optional(),
        chatRoom: z.string({required_error:"You must give the chat room locaton or id to send the message"})
    })
})

export const MessageValidation = {
    getChatRroom,
    sendMessageSchema
}