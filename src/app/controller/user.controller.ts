import { Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { UserServices } from "../service/user.service";

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
        console.log({user})
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
        console.log({user})
        const result = await UserServices.UP(user,Data)

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Profile update successfully",
            data: result
        })
    }
)

const language = catchAsync(
    async( req:Request, res:Response ) => {
        const user = (req as any)?.user;
        const {...Data} = req.body;
        console.log({user})
        const result = await UserServices.UP(user,Data)

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Profile update successfully",
            data: result
        })
    }
)

export const UserController = {
    signupUser,
    profile,
    update,
    language
}