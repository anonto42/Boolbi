import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ProviderService } from "../service/provider.service";
import { getSingleFilePath } from "../../shared/getFilePath";


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

const DOrder = catchAsync(
    async( req, res ) => {
        const user = (req as any)?.user;
        const orderID = req.query.orderID;
        const result = ProviderService.dOrder(user,orderID as string)

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Order deleted successfully",
            data: result
        })
    }
)

const CDelivery = catchAsync(
    async( req, res ) => {
        const user = (req as any)?.user;
        const doc = getSingleFilePath(req.files,"doc")
        const image = getSingleFilePath(req.files,"image")
        const {...Data} = req.body;
        const result = await ProviderService.deliveryRequest(user,Data,doc as string,image as string)
        
        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Delivery request successfully send!",
            data: result
        })
    }
) 

const GDRequest = catchAsync(
    async( req, res ) => {
        const user = (req as any)?.user;
        const result = await ProviderService.getDeliveryReqests(user);
        
        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Delivery get successfully!",
            data: result
        })
    }
) 

export const ProviderController = {
    gOrder,
    DOrder,
    CDelivery,
    GDRequest
}