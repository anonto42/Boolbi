import { Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { AuthServices } from "../service/auth.service";
import { USER_ROLES } from "../../enums/user.enums";
import config from "../../config";

const SignIn = catchAsync(
    async( req: Request, res: Response ) => {
        const {...data} = req.body;
        const result = await AuthServices.signIn(data);

        if (result.user.role === USER_ROLES.ADMIN || result.user.role === USER_ROLES.SUPER_ADMIN) {
            const expirDate = Number(config.jwt_expire.split("")[0])
            return res
                    .cookie('authorization', result.token, {
                        httpOnly: true,
                        secure: config.node_env === 'production',
                        sameSite: 'strict',
                        maxAge: expirDate
                    })
                    .json({
                        sucess: true,
                        statusCode: StatusCodes.OK,
                        message: "Welcome to deshboard",
                    })
        }
        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "User login successfully",
            data: result
        })
    }
)

const getOpt = catchAsync(
    async( req: Request, res: Response ) => {
        const {...data} = req.body;
        const result = await AuthServices.emailSend(data);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "An OTP has been sent to ${user.email}. Please check your inbox and continue!",
            data: result
        })
    }
)


export const AuthController = {
    SignIn,
    getOpt,
}