import { JwtPayload } from "jsonwebtoken"
import User from "../../model/user.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiError";
import { ACCOUNT_STATUS } from "../../enums/user.enums";
import Order from "../../model/order.model";
import DeliveryRequest from "../../model/deliveryRequest.model";

const singleOrder = async (
    payload: JwtPayload,
    orderID: string
) => {
    const { userID } = payload;
    const isExist = await User.findOne({_id: userID});
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_FOUND,"User not exist!")
    };
    if ( isExist.accountStatus === ACCOUNT_STATUS.DELETE || isExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isExist.accountStatus.toLowerCase()}!`)
    };
    const order = await Order.findById(orderID);
    if (!order) {
        throw new ApiError(StatusCodes.NOT_FOUND,"Order not exist!")
    };
    if(order.serviceProvider.toString() !== userID.toString() && order.customer.toString() !== userID.toString()){
        throw new ApiError(StatusCodes.BAD_GATEWAY,"You are not authorize to access this order")
    };

    return order
}

const AllOrders = async (
    payload: JwtPayload,
) => {
    const { userID } = payload;
    const isExist = await User.findOne({_id: userID})
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_FOUND,"User not exist!")
    };

    if ( isExist.accountStatus === ACCOUNT_STATUS.DELETE || isExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isExist.accountStatus.toLowerCase()}!`)
    };

    const allOrders = await User.aggregate([
        {
            $match:{ _id: isExist._id }
        },
        {
            $lookup:{
                from: "orders",
                localField: "createdOrder",
                foreignField:"_id",
                as: "createdOrder"
            }
        }
    ])

    return allOrders[0].createdOrder
}

const dOrder = async (
    user: JwtPayload,
    orderID: string
) => {
    const { userID } = user;
    const isExist = await User.findById(userID)
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_FOUND,"User not exist!")
    };
    if ( isExist.accountStatus === ACCOUNT_STATUS.DELETE || isExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isExist.accountStatus.toLowerCase()}!`)
    };
    const order = await Order.findById(orderID);
    if (!order) {
        throw new ApiError(StatusCodes.NOT_FOUND,"Order not exist!")
    };

    isExist.orders = isExist.orders.filter( (e:any) => e !== order._id);
    isExist.save();

    return true
}

const deliveryRequest = async (
    payload: JwtPayload,
    data: { orderID: string, uploatedProject: string, projectDoc: string},
    pdf: string,
    image: string
) => {
    const {userID} = payload;
    const { orderID, uploatedProject, projectDoc} = data;
    const isOrderExist = await Order.findOne({_id: orderID});
    const isUserExist = await User.findOne({_id: userID});
    if (!isUserExist) {
        throw new ApiError(StatusCodes.NOT_FOUND,"User not exist!")
    };
    if (!isOrderExist) {
        throw new ApiError(StatusCodes.NOT_FOUND,"Order not exist!")
    };
    if ( isOrderExist.accountStatus === ACCOUNT_STATUS.DELETE || isOrderExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isOrderExist.accountStatus.toLowerCase()}!`)
    };
    if (!pdf && !image) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"You must give atlast one image of file for send a delivery request")
    };

    const delivaryData = {
        orderID,
        projectDoc,
        uploatedProject,
        pdf,
        projectImage: image,
        customer: isOrderExist.customer
    }

    const delivaryRequest = await DeliveryRequest.create(delivaryData)

    return delivaryRequest;

}

const getDeliveryReqests = async (
    payload: JwtPayload
) => {
    const { userID } = payload;
    const isExist = await User.findOne({_id: userID});
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_FOUND,"User not exist!")
    };
    if ( isExist.accountStatus === ACCOUNT_STATUS.DELETE || isExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isExist.accountStatus.toLowerCase()}!`)
    };

    const deliveryRequest = await DeliveryRequest.aggregate([
        {
            $match: { customer: isExist._id }
        },
        {
            $lookup: {
              from: "orders",
              localField: "orderID",
              foreignField: "_id",
              as: "orderDetails"
            }
        },
    ])

    return deliveryRequest;
}

const reqestAction = async (
    user: JwtPayload,
    requestData: {
        acction: "DECLINE" | "APPROVE";
        requestID: string
    }
) => {
    const { userID } = user;
    const { acction, requestID } = requestData;
    const isUser = await User.findOne({_id: userID});
    if (!isUser) {
        throw new ApiError(StatusCodes.NOT_FOUND,"User not exist!")
    };
    if ( isUser.accountStatus === ACCOUNT_STATUS.DELETE || isUser.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUser.accountStatus.toLowerCase()}!`)
    };

    const delivaryRequest = await DeliveryRequest.findByIdAndUpdate(requestID,{ requestStatus: acction },{new: true});
    if (!delivaryRequest) {
        throw new ApiError(StatusCodes.FAILED_DEPENDENCY,"Something was problem on delivery request oparation!")
    }

    return delivaryRequest
}

export const ProviderService = {
    deliveryRequest,
    singleOrder,
    AllOrders,
    dOrder,
    getDeliveryReqests,
    reqestAction
}