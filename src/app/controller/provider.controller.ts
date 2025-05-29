import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ProviderService } from "../service/provider.service";
import { getMultipleFilesPath, getSingleFilePath } from "../../shared/getFilePath";


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
        const result = await ProviderService.dOrder(user,orderID as string);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Order deleted successfully",
            data: result
        })
    }
)

const completedOrders = catchAsync(
    async( req, res ) => {
        const user = (req as any)?.user;
        const result = await ProviderService.AllCompletedOrders(user)

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Successfully get all completed orders!",
            data: result
        })
    }
)

const CDelivery = catchAsync(
    async( req, res ) => {
        const user = (req as any)?.user;
        const doc = getSingleFilePath(req.files,"doc")
        const image = getMultipleFilesPath(req.files,"image")
        const {...Data} = req.body;
        const result = await ProviderService.deliveryRequest(user,Data,doc as string,image as string[])
        
        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Delivery request successfully send!",
            data: result
        })
    }
) 

const ADelivery = catchAsync(
    async( req, res ) => {
        const user = (req as any)?.user;
        const requestId = req.query.id as string;
        const result = await ProviderService.ADeliveryReqest(user,requestId)
        
        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Delivery request successfully send!",
            data: result
        })
    }
) 

const extendsDeliveryRequest = catchAsync(
    async( req, res ) => {
        const user = (req as any)?.user;
        const { ...Data } = req.body; 
        const result = await ProviderService.deliveryTimeExtendsRequest(user,Data)
        
        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Delivery extends request successfully send!",
            data: result
        })
    }
) 

const delivaryTimeExtendsRequest = catchAsync(
    async( req, res ) => {
        const user = (req as any)?.user;
        const {...data} = req.body;
    
        const result = await ProviderService.DelivaryRequestForTimeExtends(user,data);
    
        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Successfully intract with request!",
            data: result
        })
    }
) 

const deliveryRequests = catchAsync(
    async( req, res ) => {
        const user = (req as any)?.user;
        const id = req.query.requestID as string;
    
        let result;
        if (!id) {
            result = await ProviderService.getDeliveryTimeExtendsRequest(user);
        }else{
            result = await ProviderService.getADeliveryTimeExtendsRequest(user,id);
        }
        
        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Delivery extends request successfully send!",
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

const requestStatueUpdate = catchAsync(
    async( req, res ) => {
        const user = (req as any)?.user;
        const {...data} = req.body;
        const result = await ProviderService.reqestAction(user,data);
        
        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Delivery request updated successfully!",
            data: result
        })
    }
) 

const providerAccountVerification = catchAsync(
    async( req, res ) => {
        const user = (req as any)?.user;
        const images = getMultipleFilesPath(req.files,"image");
        const license = getSingleFilePath(req.files,"doc")
        const result = await ProviderService.providerAccountVerification(user,images as string[],license as string);
        
        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Account verification updated successfully!",
            data: result
        })
    }
) 

const verificatioData = catchAsync(
    async( req, res ) => {
        const user = (req as any)?.user;
        const result = await ProviderService.verificationData(user);
        
        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Account verification get successfully!",
            data: result
        })
    }
)

export const ProviderController = {
    gOrder,
    DOrder,
    verificatioData,
    CDelivery,
    GDRequest,
    ADelivery,
    deliveryRequests,
    completedOrders,
    requestStatueUpdate,
    delivaryTimeExtendsRequest,
    providerAccountVerification,
    extendsDeliveryRequest
}