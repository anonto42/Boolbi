import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { PaymentService } from "../service/payment.service";
import ApiError from "../../errors/ApiError";
import { accountLinks, accounts } from "../router/payment.route";
import { paymentSuccessfull } from "../../shared/paymentTemplate";

const payForService = catchAsync(
    async( req: Request, res: Response ) => {
        const payload = (req as any).user;
        const protocol = req.protocol as string;
        const { offerID } = req.body;
        if (!offerID) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                "Offer id is required!"
            )
        }
        const host = req.headers.host as string;
        const result = await PaymentService.createSession(
            payload,
            {host,protocol},
            {offerID}
        );

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Now you can pay with the payment url!",
            data: result
        })
    }
)

const verifyUser = catchAsync(
    async( req: Request, res: Response ) => {
        const payload = (req as any).user;
        const host = req.headers.host as string;
        const protocol = req.protocol as string;
        const result = await PaymentService.verifyProvider( payload, { host, protocol } );

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Verify service provider!",
            data: result
        })
    }
)

// const givesalary = catchAsync(
//     async( req: Request, res: Response ) => {
//         const payload = (req as any).user;
//         const order = req.query.orderId as string;
//         const result = await PaymentService.chargeCustomer( payload, order );

//         sendResponse(res, {
//             success: true,
//             statusCode: StatusCodes.OK,
//             message: "Salary goted successfull!",
//             data: result
//         })
//     }
// )

const successFullSession = catchAsync(
    async( req: Request, res: Response ) => {
        
    const { id } = req.params;
    const account = await accounts.update(id, {});
    
    if (
        account?.requirements?.disabled_reason &&
        account?.requirements?.disabled_reason.indexOf('rejected') > -1
    ) {
        return res.redirect(
        `${req.protocol + '://' + req.get('host')}/api/v1/payment/refresh/${id}`,
        );
    }
    if (
        account?.requirements?.disabled_reason &&
        account?.requirements?.currently_due &&
        account?.requirements?.currently_due?.length > 0
    ) {
        return res.redirect(
        `${req.protocol + '://' + req.get('host')}/api/v1/payment/refresh/${id}`,
        );
    }
    if (!account.payouts_enabled) {
        return res.redirect(
        `${req.protocol + '://' + req.get('host')}/api/v1/payment/refresh/${id}`,
        );
    }
    if (!account.charges_enabled) {
        return res.redirect(
        `${req.protocol + '://' + req.get('host')}/api/v1/payment/refresh/${id}`,
        );
    }
    
    if (
        account?.requirements?.pending_verification &&
        account?.requirements?.pending_verification?.length > 0
    ) {
        // return res.redirect(`${req.protocol + '://' + req.get('host')}/payment/refreshAccountConnect/${id}`);
    }
    
    res.send(paymentSuccessfull)
    }
)

const refreshSesstion = catchAsync(
    async( req: Request, res: Response ) => {
        
    const { id } = req.params;
    
    const host = req.headers.host as string;
    const protocol = req.protocol as string;
    const account = await accounts.update(id, {});
    
    const onboardLInk = await accountLinks.create({
            account: account.id,
            refresh_url: `${protocol}://${host}/api/v1/payment/refresh/${account.id}`,
            return_url: `${protocol}://${host}/api/v1/payment/success/${account.id}`,
            type: "account_onboarding"
        });

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Re verification url!",
            data: { url: onboardLInk.url }
        });
    }
)


export const PaymentController = {
    payForService,
    // chargeUser,
    // givesalary,
    verifyUser,
    refreshSesstion,
    successFullSession
}