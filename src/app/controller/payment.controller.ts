import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { PaymentService } from "../service/payment.service";

const createSession = catchAsync(
    async( req: Request, res: Response ) => {
        const payload = (req as any).user;
        const protocol = req.protocol as string;
        const host = req.headers.host as string;
        const result = await PaymentService.createSession(
            payload,
            host,
            protocol
        );

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Now you can pay with the payment url!",
            data: result
        })
    }
)

const chargeUser = catchAsync(
    async( req: Request, res: Response ) => {
        const payload = (req as any).user;
        const offerID = req.query.orderID as string;
        const result = await PaymentService.chargeCustomer( payload, offerID );

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Payment successfull!",
            data: result
        })
    }
)

const givesalary = catchAsync(
    async( req: Request, res: Response ) => {
        const payload = (req as any).user;
        const order = req.query.orderId as string;
        const result = await PaymentService.chargeCustomer( payload, order );

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Salary goted successfull!",
            data: result
        })
    }
)

export const PaymentController = {
    createSession,
    chargeUser,
    givesalary
}