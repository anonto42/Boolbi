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

export const UserController = {
    signupUser,
}