import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { messageService } from "../service/message.service";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { chatService } from "../service/chat.service";
import { getSingleFilePath } from "../../shared/getFilePath";

const createChat = catchAsync(
    async( req: Request, res: Response ) => {
        const {userID} = ( req as any ).user;
        const {...data} = req.body;
        const result = await chatService.createChat(userID,data);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: `Successfull get the chats`,
            data: result
        })
    }
)

const chatRooms = catchAsync(
    async( req: Request, res: Response ) => {
        const payload = (req as any).user;
        const { page, limit} = req.body;
        const result = await chatService.allChats(payload.userID,page,limit);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Successfull get all the chat rooms that you engaged",
            data: result
        })
    }
)

const deleteChat = catchAsync(
    async( req: Request, res: Response ) => {
        const payload = (req as any).user;
        const chatID = req.query.chatID as string;
        const result = await chatService.deleteChat(payload.userID,chatID);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Successfull get all the chat rooms that you engaged",
            data: result
        })
    }
)

const singleChatRoom = catchAsync(
    async( req: Request, res: Response ) => {
        const roomID = req.query.chatID as string;
        const result = await chatService.getChatById(roomID);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: `Successfull get the chat`,
            data: result
        })
    }
)

const sendMessage = catchAsync(
    async( req: Request, res: Response ) => {
        const user = ( req as any ).user;
        const { ...data } = req.body;
        const image = getSingleFilePath(req.files,"image")
        const result = await messageService.addMessage(user, data, image);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: `Successfull send the message`,
            data: result
        })
    }
)

const allMessages = catchAsync(
    async( req: Request, res: Response ) => {
        const {userID} = ( req as any ).user;
        const { limit, chatID, page } = req.body;
        const result = await messageService.getMessages(chatID, userID,{limit,page});

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: `Successfull get all the messges`,
            data: result
        })
    }
)

const deleteMessage = catchAsync(
    async( req: Request, res: Response ) => {
        const {userID} = ( req as any ).user;
        const messageID = req.query.id as string;
        const result = await messageService.deleteMessage( messageID );

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: `Successfull delete the messge`,
            data: result
        })
    }
)

const deleteAllMessageOfARoom = catchAsync(
    async( req: Request, res: Response ) => {
        const {userID} = ( req as any ).user;
        const chatID = req.query.chatId as string;
        const result = await messageService.deleteMessagesByChatId( chatID );

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: `Successfull delete the messge`,
            data: result
        })
    }
)

export const MessageController = {
    chatRooms,
    singleChatRoom,
    createChat,
    deleteChat,
    sendMessage,
    allMessages,
    deleteMessage,
    deleteAllMessageOfARoom
}