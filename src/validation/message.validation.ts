import { z } from "zod";
import { MESSAGE_TYPE } from "../enums/message.enum";

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

const sendMessge = z.object({
    body: z.object({
        content: z.string({ required_error: "you must give a message to send somting! "}),
        chatID: z.string({required_error: "You must give the chat id to send a message!"}),
        messageType: z.enum([MESSAGE_TYPE.MESSAGE, MESSAGE_TYPE.NOTIFICATION, MESSAGE_TYPE.REQUEST])
    })
})


export const MessageValidation = {
    getChatRroom,
    createChatRoom,
    deleteRoom,
    sendMessge
}