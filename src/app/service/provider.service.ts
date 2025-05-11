import { JwtPayload } from "jsonwebtoken"
import User from "../../model/user.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiError";
import { ACCOUNT_STATUS } from "../../enums/user.enums";
import Order from "../../model/order.model";


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




export const ProviderService = {
    singleOrder,
    AllOrders
}