import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { messageService } from "../service/message.service";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { chatService } from "../service/chat.service";

const chatRooms = catchAsync(
    async( req: Request, res: Response ) => {
        const payload = (req as any).user;
        const result = await chatService.getMyChatList(payload.userID);

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
        const roomID = req.query.chatID;
        const result = await messageService.getMessages(roomID as string,{limit: 10,page: 6});

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: `Successfull get the chats`,
            data: result
        })
    }
)

export const MessageController = {
    chatRooms,
    singleChatRoom
}