import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { MessageService } from "../service/message.service";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { getSingleFilePath } from "../../shared/getFilePath";

const sendMessage = catchAsync(
    async( req: Request, res: Response ) => {
        const payload = (req as any).user;
        const {...data} = req.body;
        const image = getSingleFilePath(req.files,"image");
        const result = await MessageService.sendMessageSend(payload,data,image as string);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "message send successfull",
            data: result
        })
    }
)

const chatRooms = catchAsync(
    async( req: Request, res: Response ) => {
        const payload = (req as any).user;
        const result = await MessageService.chatRooms(payload);

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
        const payload = (req as any).user;
        const roomID = req.query.roomID;
        const postID = req.query.postID;
        const result = await MessageService.getSingleChatRoom(payload,roomID as string,postID as string);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: `Successfull get the ${ result.chatName } chat room`,
            data: result
        })
    }
)

const createChatRooms = catchAsync(
    async( req: Request, res: Response ) => {
        const payload = (req as any).user;
        const {...data} = req.body
        const result = await MessageService.createChatRoom(payload,data);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Successfull created the chat room",
            data: result
        })
    }
)

export const MessageController = {
    sendMessage,
    chatRooms,
    singleChatRoom,
    createChatRooms
}