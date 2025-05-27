import { JwtPayload } from "jsonwebtoken"
import User from "../../model/user.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiError";
import { ACCOUNT_STATUS } from "../../enums/user.enums";
import Order from "../../model/order.model";
import DeliveryRequest from "../../model/deliveryRequest.model";
import Notification from "../../model/notification.model";

const singleOrder = async (
    payload: JwtPayload,
    orderID: string
) => {
    const { userID } = payload;
    const isExist = await User.findOne({_id: userID});
    if (!isExist) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "User not exist!"
        )
    };
    if ( isExist.accountStatus === ACCOUNT_STATUS.DELETE || isExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(
            StatusCodes.FORBIDDEN,
            `Your account was ${isExist.accountStatus.toLowerCase()}!`
        )
    };

    const order = await Order.findById(orderID)
                                .populate("offerID");
    if (!order) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "Order not exist!"
        )
    };

    console.log(
        order.offerID.to,
        order.offerID.form,isExist._id
    )
    
    if(
        order.offerID.to === isExist._id && 
        order.offerID.form === isExist._id 
    ){
        throw new ApiError(StatusCodes.BAD_GATEWAY,"You are not authorize to access this order")
    };

    return order
}

const AllOrders = async (
    payload: JwtPayload,
) => {
    const { userID } = payload;
    const isExist = await User.findOne({_id: userID})
                                .populate("orders")
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_FOUND,"User not exist!")
    };

    if ( isExist.accountStatus === ACCOUNT_STATUS.DELETE || isExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isExist.accountStatus.toLowerCase()}!`)
    };

    const allOrders = await isExist
                            .populate("orders.offerID")

    return allOrders.orders
}

const AllCompletedOrders = async (
    payload: JwtPayload,
) => {
    const { userID } = payload;
    const isExist = await User.findOne({_id: userID})
                                .populate("orders")
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_FOUND,"User not exist!")
    };

    if ( isExist.accountStatus === ACCOUNT_STATUS.DELETE || isExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isExist.accountStatus.toLowerCase()}!`)
    };
    const allOrders = isExist.orders.filter((e: any) => 
        e?.trackStatus?.isComplited?.status === true
    );
    return allOrders
}

const dOrder = async (
    user: JwtPayload,
    orderID: string
) => {
    const { userID } = user;
    const isExist = await User.findById(userID)
    if (!isExist) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "User not exist!"
        )
    };
    if ( 
        isExist.accountStatus === ACCOUNT_STATUS.DELETE || 
        isExist.accountStatus === ACCOUNT_STATUS.BLOCK 
    ) {
        throw new ApiError(
            StatusCodes.FORBIDDEN,
            `Your account was ${isExist.accountStatus.toLowerCase()}!`
        )
    };
    const order = await Order.findOneAndDelete({
        "trackStatus.isComplited": true,
        _id: orderID
    });
    if (!order) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "Order not exist!"
        )
    };

    isExist.orders = isExist.orders.filter( (e:any) => e.toString() !== orderID );
    await isExist.save();
    return true
}

const deliveryRequest = async (
    payload: JwtPayload,
    data: { 
        orderID: string, 
        uploatedProject: string, 
        projectDoc: string
    },
    pdf: string,
    image: string[]
) => {
    const {userID} = payload;
    const { orderID, uploatedProject, projectDoc} = data;
    const isOrderExist = await Order.findOne({_id: orderID}).populate("offerID");
    const isUserExist = await User.findOne({_id: userID});
    if (!isUserExist) {
        throw new ApiError(
        StatusCodes.NOT_FOUND,
        "User not exist!"
    )
    };
    if (!isOrderExist) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "Order not exist!"
        )
    };
    if ( 
        isOrderExist.accountStatus === ACCOUNT_STATUS.DELETE || 
        isOrderExist.accountStatus === ACCOUNT_STATUS.BLOCK 
    ) {
        throw new ApiError(
            StatusCodes.FORBIDDEN,
            `Your account was ${isOrderExist.accountStatus.toLowerCase()}!`
        )
    };
    if (!pdf && !image) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "You must give atlast one image of file for send a delivery request"
        )
    };

    const delivaryData = 
        {
            for: isOrderExist.offerID.form,
            orderID,
            projectDoc,
            uploatedProject,
            pdf,
            images: image
        }

    const delivaryRequest = await DeliveryRequest.create(delivaryData);

    const notification = await Notification.create({
      for: isOrderExist.offerID.form,
      content: `Got a new delivery request from ${isUserExist.fullName}`
    });

    //@ts-ignore
    const io = global.io;
    io.emit(`socket:${ isOrderExist.offerID.form }`,notification)

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

    const deliveryRequest = await DeliveryRequest.find({
        for: isExist._id
    })

    return deliveryRequest;
}

const ADeliveryReqest = async (
    payload: JwtPayload,
    requestId: string
) => {
    const { userID } = payload;
    const isExist = await User.findOne({_id: userID});
    if (!requestId) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "You must give the request id!"
        )
    }
    if (!isExist) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "User not exist!"
        )
    };
    if ( 
        isExist.accountStatus === ACCOUNT_STATUS.DELETE || 
        isExist.accountStatus === ACCOUNT_STATUS.BLOCK 
    ) {
        throw new ApiError(
            StatusCodes.FORBIDDEN,
            `Your account was ${isExist.accountStatus.toLowerCase()}!`
        )
    };

    const deliveryRequest = await DeliveryRequest.findById(requestId);
    if (!deliveryRequest) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "Delivery request not exist "
        )
    }

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

const providerAccountVerification = async (
    user: JwtPayload,
    images: string[],
    doc: string
) => {
    const { userID } = user;

    const isUser = await User.findById(userID);
    if (!isUser) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not exist!");
    }

    if (
        isUser.accountStatus === ACCOUNT_STATUS.DELETE ||
        isUser.accountStatus === ACCOUNT_STATUS.BLOCK
    ) {
        throw new ApiError(StatusCodes.FORBIDDEN, `Your account was ${isUser.accountStatus.toLowerCase()}!`);
    }

    if (!images || images.length < 1) {
        throw new ApiError(StatusCodes.BAD_GATEWAY, "You should provide at least 1 image");
    }

    if (!isUser.isVerified) isUser.isVerified = {};
    if (!Array.isArray(isUser.isVerified.sampleImages)) isUser.isVerified.sampleImages = [];
    if (!isUser.isVerified) isUser.isVerified = {};

    isUser.isVerified.trdLicense = doc;

    isUser.isVerified.sampleImages.push(...images);

    if (
        isUser.isVerified.trdLicense &&
        isUser.isVerified.sampleImages.length > 0
    ) {
        isUser.isVerified.status = true;
    }

    await isUser.save();

    return true;
};


export const ProviderService = {
    deliveryRequest,
    singleOrder,
    AllOrders,
    dOrder,
    getDeliveryReqests,
    reqestAction,
    providerAccountVerification,
    AllCompletedOrders,
    ADeliveryReqest
}