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

const careateChat = z.object({
    body: z.object({
        chatWith: z.string({required_error:"you must give the recever id"}), 
        chatName: z.string({required_error:"You must give the name of the chat id"}), 
        image: z.string({required_error:"you must give the chat room logo image url"})
    })
})

export const MessageValidation = {
    getChatRroom,
    sendMessageSchema,
    careateChat
}