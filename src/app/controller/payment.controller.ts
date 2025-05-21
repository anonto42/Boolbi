import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { PaymentService } from "../service/payment.service";


const createPayment = catchAsync(
    async( req: Request, res: Response ) => {
        const payload = (req as any).user;
        const offerId = req.body.offerId as string;
        const protocol = req.protocol as string;
        const host = req.headers.host as string;
        const result = await PaymentService.createCheckOut(
            payload,
            host,
            protocol,
            offerId
        );

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Now you can pay with the payment url!",
            data: result
        })
    }
)



const paymentSuccess = catchAsync(
    async( req: Request, res: Response ) => {
    //     const payload = (req as any).user;
    //     const protocol = req.protocol as string;
    //     const host = req.headers.host as string;
    //     const { offerId, amount} = req.body;
    //     const result = await PaymentService.createCheckOut({payload,host,protocol,offerId});

    //     sendResponse(res, {
    //         success: true,
    //         statusCode: StatusCodes.OK,
    //         message: "Successfully payed!",
    //         data: result
    //     })
    }
)

const paymentCancelled = catchAsync(
    async( req: Request, res: Response ) => {
    //     const payload = (req as any).user;
    //     const protocol = req.protocol as string;
    //     const host = req.headers.host as string;
    //     const { offerId, amount} = req.body;
    //     const result = await PaymentService.createCheckOut({payload,host,protocol,offerId});

    //     sendResponse(res, {
    //         success: true,
    //         statusCode: StatusCodes.OK,
    //         message: "Successfully payed!",
    //         data: result
    //     })
    }
)



export const PaymentController = {
    createPayment,
    paymentSuccess,
    paymentCancelled
}