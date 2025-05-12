import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { PaymentService } from "../service/payment.service";


const createPayment = catchAsync(
    async( req: Request, res: Response ) => {
        const payload = (req as any).user;
        const result = await PaymentService.createCustomer(payload);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "User create successfully on the stripe for payment",
            data: result
        })
    }
)

const addCard = catchAsync(
    async( req: Request, res: Response ) => {
        const payload = (req as any).user;
        const {...data} = req.body;
        const result = await PaymentService.addCard(payload,data);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Card Added successfully",
            data: result
        })
    }
)

const createCharges = catchAsync(
    async( req: Request, res: Response ) => {
        const payload = (req as any).user;
        const { amount, orderID} = req.query;
        const result = await PaymentService.makePayment(payload,Number(amount),orderID as string);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Payment successfully done!",
            data: result
        })
    }
)


export const PaymentController = {
    createPayment,
    addCard,
    createCharges
}