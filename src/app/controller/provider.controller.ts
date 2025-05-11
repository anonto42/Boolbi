import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ProviderService } from "../service/provider.service";


const gOrder = catchAsync(
    async( req, res ) => {
        const user = (req as any)?.user;
        const orderID = req.query.orderID;
        let result;
        if (orderID) {
            result = await ProviderService.singleOrder(user,orderID as string);
        } else if ( !orderID ) {
            result = await ProviderService.AllOrders(user)
        }

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Order get successfully",
            data: result
        })
    }
)


export const ProviderController = {
    gOrder,
}