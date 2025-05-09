import { Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { UserServices } from "../service/user.service";
import { getMultipleFilesPath } from "../../shared/getFilePath";

const signupUser = catchAsync(
    async( req: Request, res: Response ) => {
        const {...data} = req.body;
        const result = await UserServices.signUp(data)

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "User registered successfull",
            data: result
        })
    }
)

const profile = catchAsync(
    async( req, res ) => {
        const user = (req as any)?.user;
        const result = await UserServices.profle(user)

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "User profile data get successfully",
            data: result
        })
    }
)

const update = catchAsync(
    async( req, res ) => {
        const user = (req as any)?.user;
        const {...Data} = req.body;
        const result = await UserServices.UP(user,Data)

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Profile update successfully",
            data: result
        })
    }
)

const uploadImages = catchAsync(
    async( req, res ) => {
        const user = (req as any)?.user;
        const {...Data} = req.body;

        const image = getMultipleFilesPath(req.files,"image")
        const result = await UserServices.Images(user,Data,image!)

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Successfully got the images",
            data: result
        })
    }
)

const language = catchAsync(
    async( req:Request, res:Response ) => {
        const payload = (req as any)?.user;
        const { language } = req.body;
        const result = await UserServices.language({payload,language})

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Profile update successfully",
            data: result
        })
    }
)

const postJob = catchAsync(
    async( req:Request, res:Response ) => {
        const payload = (req as any)?.user;
        const { ...data } = req.body;
        const images = getMultipleFilesPath(req.files,"image")
        const result = await UserServices.jobPost(payload, data, images as string[])

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Successfully posted your job Post",
            data: result
        })
    }
)

export const UserController = {
    signupUser,
    profile,
    update,
    language,
    uploadImages,
    postJob
}