import { Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const signupUser = catchAsync(
    async( req: Request, res: Response ) => {
        const {...data} = req.body;
        const result = await UserController.signupUser

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Route successfull connected!",
            data: result
        })
    }
)

export const UserController = {
    signupUser,
}