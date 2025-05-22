import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { messageService } from "../service/message.service";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { chatService } from "../service/chat.service";

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
        const result = await chatService.allChats(payload.userID);

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

export const MessageController = {
    chatRooms,
    singleChatRoom,
    createChat,
    deleteChat
}