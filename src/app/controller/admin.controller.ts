import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { AdminService } from "../service/admin.service";

const overView = catchAsync(
    async( req: Request, res: Response ) => {
        const Payload = (req as any).user;
        const result = await AdminService.overview(Payload);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes .OK,
            message: "Admin overview data get successfully",
            data: result
        })
    }
)
// Have to make a user_admin_creator_function


export const AdminController = {
    overView
}