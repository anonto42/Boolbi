import { JwtPayload } from "jsonwebtoken"
import User from "../../model/user.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiError";
import { ACCOUNT_STATUS, ACCOUNT_VERIFICATION_STATUS, USER_ROLES } from "../../enums/user.enums";
import Order from "../../model/order.model";
import DeliveryRequest from "../../model/deliveryRequest.model";
import Notification from "../../model/notification.model";
import { DELIVERY_STATUS, REQUEST_TYPE } from "../../enums/delivery.enum";
import mongoose from "mongoose";
import { transfers } from "../router/payment.route";
import Verification from "../../model/verifyRequest.model";
import Payment from "../../model/payment.model";
import { PAYMENT_STATUS } from "../../enums/payment.enum";
import { PaginationParams } from "../../types/user";
import { OFFER_STATUS } from "../../enums/offer.enum";

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
  params: PaginationParams = {}
) => {
  const { userID } = payload;
  const { page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const user = await User.findOne({ _id: userID });
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not exist!");
  }

  if (
    user.accountStatus === ACCOUNT_STATUS.DELETE ||
    user.accountStatus === ACCOUNT_STATUS.BLOCK
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      `Your account was ${user.accountStatus.toLowerCase()}!`
    );
  }

  // Get total order count
  const totalOrders = await Order.countDocuments({ _id: { $in: user.orders } });

  // Fetch paginated orders and populate
  const paginatedOrders = await Order.find({ _id: { $in: user.orders } })
    .skip(skip)
    .limit(limit)
    .populate("offerID")
    .sort({ createdAt: -1 });

  return {
    data: paginatedOrders,
    total: totalOrders,
    currentPage: page,
    totalPages: Math.ceil(totalOrders / limit),
  };
};

const AllCompletedOrders = async (
  payload: JwtPayload,
  params: PaginationParams = {}
) => {
  const { userID } = payload;
  const { page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const isExist = await User.findOne({ _id: userID }).populate({
    path: "orders",
    populate: { path: "offerID" }
  });

  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not exist!");
  }

  if (
    isExist.accountStatus === ACCOUNT_STATUS.DELETE ||
    isExist.accountStatus === ACCOUNT_STATUS.BLOCK
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      `Your account was ${isExist.accountStatus.toLowerCase()}!`
    );
  }

  // Filter completed orders
  const completedOrders = isExist.orders.filter(
    (order: any) => order?.trackStatus?.isComplited?.status === true
  );

  const total = completedOrders.length;
  const paginatedOrders = completedOrders.slice(skip, skip + limit);

  return {
    data: paginatedOrders,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
  };
};

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
    const order = await Order.findById(orderID);
    if (!order) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "Order not exist!"
        )
    };
    if ( order.provider.toString() !== isExist._id.toString() && order.customer.toString() !== isExist._id.toString() ) {
        throw new ApiError(
            StatusCodes.METHOD_NOT_ALLOWED,
            "You are not authorize to delete this order!"
        )
    };

    await Order.deleteOne({ _id: order._id })

    isExist.orders = isExist.orders.filter( (e:any) => e.toString() !== orderID );
    await isExist.save();
    return true;
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
        isUserExist.accountStatus === ACCOUNT_STATUS.DELETE || 
        isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK 
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
            for: isOrderExist.customer,
            orderID,
            projectDoc,
            requestType: REQUEST_TYPE.DELIVERY,
            uploatedProject,
            pdf,
            images: image
        }

    const delivaryRequest = await DeliveryRequest.create(delivaryData);

    isOrderExist.deliveryRequest.isRequested = true;
    isOrderExist.deliveryRequest.requestID = delivaryRequest._id;

    await isOrderExist.save();

    const notification = await Notification.create({
      for: isOrderExist.customer,
      content: `Got a new delivery request from ${isUserExist.fullName}`
    });

    //@ts-ignore
    const io = global.io;
    io.emit(`socket:${ isOrderExist.customer }`,notification)

    return delivaryRequest;

}

const deliveryTimeExtendsRequest = async (
    payload: JwtPayload,
    data: {
        reason: string,
        nextDate: string,
        orderID: string
    }
) => {
    const { userID } = payload;
    const { orderID, reason, nextDate } = data;
    const isOrderExist = await Order.findById(orderID).populate("offerID");
    const isUserExist = await User.findById(userID);
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
        isUserExist.accountStatus === ACCOUNT_STATUS.DELETE || 
        isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK 
    ) {
        throw new ApiError(
            StatusCodes.FORBIDDEN,
            `Your account was ${isOrderExist.accountStatus.toLowerCase()}!`
        )
    };

    const delivaryData = 
    {
        for: isOrderExist.customer,
        orderID,
        projectDoc: reason,
        requestType: REQUEST_TYPE.TIME_EXTEND,
        nextExtendeDate: nextDate,
    }

    await DeliveryRequest.create(delivaryData);

    const notification = await Notification.create({
      for: isOrderExist.customer,
      content: `Got a new delivery time extends request from ${isUserExist.fullName}`
    });

    //@ts-ignore
    const io = global.io;
    io.emit(`socket:${ isOrderExist.customer }`,notification)

    return true;
}

const getDeliveryTimeExtendsRequest = async (
  payload: JwtPayload,
  params: PaginationParams = {}
) => {
  const { userID } = payload;
  const { page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const isUserExist = await User.findById(userID);
  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not exist!");
  }

  if (
    isUserExist.accountStatus === ACCOUNT_STATUS.DELETE ||
    isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      `Your account was ${isUserExist.accountStatus.toLowerCase()}!`
    );
  }

  const total = await DeliveryRequest.countDocuments({
    for: new mongoose.Types.ObjectId(isUserExist._id),
    requestType: "TIME_EXTEND",
  });

  const requests = await DeliveryRequest.find({
    for: new mongoose.Types.ObjectId(isUserExist._id),
    requestType: "TIME_EXTEND",
  })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  return {
    data: requests,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
  };
};

const getADeliveryTimeExtendsRequest = async (
    payload: JwtPayload,
    requestId: string
) => {
    const { userID } = payload;
    const isUserExist = await User.findById(userID);
    if (!isUserExist) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "User not exist!"
        )
    };
    if ( 
        isUserExist.accountStatus === ACCOUNT_STATUS.DELETE || 
        isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK 
    ) {
        throw new ApiError(
            StatusCodes.FORBIDDEN,
            `Your account was ${isUserExist.accountStatus.toLowerCase()}!`
        )
    };
    
    const requests = await DeliveryRequest.findById(requestId)

    return requests;
}

const getDeliveryReqests = async (
  payload: JwtPayload,
  params: PaginationParams = {}
) => {
  const { userID } = payload;
  const { page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const isExist = await User.findOne({ _id: userID });
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not exist!");
  }

  if (
    isExist.accountStatus === ACCOUNT_STATUS.DELETE ||
    isExist.accountStatus === ACCOUNT_STATUS.BLOCK
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      `Your account was ${isExist.accountStatus.toLowerCase()}!`
    );
  }

  const totalRequests = await DeliveryRequest.countDocuments({ for: isExist._id });

  const deliveryRequests = await DeliveryRequest.find({ for: isExist._id })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  return {
    data: deliveryRequests,
    total: totalRequests,
    currentPage: page,
    totalPages: Math.ceil(totalRequests / limit),
  };
};

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
            "Delivery request not exist!"
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
    if ( 
        isUser.accountStatus === ACCOUNT_STATUS.DELETE || 
        isUser.accountStatus === ACCOUNT_STATUS.BLOCK 
    ) {
        throw new ApiError(
            StatusCodes.FORBIDDEN,
            `Your account was ${isUser.accountStatus.toLowerCase()}!`
        )
    };

    if (acction === "DECLINE") {
        const request = await DeliveryRequest   
                .findByIdAndUpdate(
                    requestID,
                    {
                        requestStatus: DELIVERY_STATUS.DECLINE
                    }
                )
        const order = await Order.findById(request.orderID).populate("customer", "fullName");
        const notification = await Notification.create({
            for: order.provider,
            content: `Your delivery request was cancelled by ${order.customer.fullName}`
        });

        order.status = OFFER_STATUS.DECLINE
        await order.save();

        //@ts-ignore
        const io = global.io;
        io.emit(`socket:${ order.provider }`, notification)

        return;
    };

    const delivaryRequest = await DeliveryRequest
                                .findByIdAndUpdate(
                                    requestID,
                                    { 
                                        requestStatus: acction 
                                    },{
                                        new: true
                                    });

    const order = await Order
                .findByIdAndUpdate(delivaryRequest.orderID)
                .populate("provider")
                .populate("offerID")

    const budget = order.offerID.budget;
    const amountAfterFee = Math.round(budget * 0.95 * 100);

    await transfers.create({
        amount: amountAfterFee,
        currency: 'usd',
        destination: order.provider.paymentCartDetails.accountID,
        transfer_group: `order_${order._id}`
    });

    if (!delivaryRequest) {
        throw new ApiError(
            StatusCodes.FAILED_DEPENDENCY,
            "Something was problem on delivery request oparation!"
        )
    };
    if (!order) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "We don't found the order!"
        )
    };

    const notification = await Notification.create({
        for: order.provider._id,
        content: `Your order was delivared successfully`
    });

    await Order.findByIdAndUpdate(
        order._id,
        {
            $set:{
                "trackStatus.isComplited" : true
            }
        }
    )
    
    //@ts-ignore
    const io = global.io;
    io.emit(`socket:${ order.provider._id }`,notification)

    await Payment.create({
        userId: order.customer,
        orderId: order._id,
        amount: budget,
        commission: amountAfterFee,
        status: PAYMENT_STATUS.SUCCESS
    })

    return true
}

const DelivaryRequestForTimeExtends = async (
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
    if ( 
        isUser.accountStatus === ACCOUNT_STATUS.DELETE || 
        isUser.accountStatus === ACCOUNT_STATUS.BLOCK 
    ) {
        throw new ApiError(
            StatusCodes.FORBIDDEN,
            `Your account was ${isUser.accountStatus.toLowerCase()}!`
        )
    };

    if (acction === "DECLINE") {
        const request = await DeliveryRequest   
                .findByIdAndUpdate(
                    requestID,
                    {
                        requestStatus: DELIVERY_STATUS.DECLINE
                    }
                )
        const order = await Order.findById(request.orderID).populate("customer", "fullName");
        
        const notification = await Notification.create({
            for: order.provider,
            content: `Your delivery time extends request was cancelled by ${order.customer.fullName}`
        });

        //@ts-ignore
        const io = global.io;
        io.emit(`socket:${ order.provider }`, notification)
    };

    const delivaryRequest = await DeliveryRequest
                                .findByIdAndUpdate(
                                    requestID,
                                    { 
                                        requestStatus: acction 
                                    },{
                                        new: true
                                    });

    const order = await Order.findByIdAndUpdate(
        delivaryRequest.orderID,
        {
            deliveryDate: delivaryRequest.nextExtendeDate
        }
    ).populate("customer","fullName")
    if (!delivaryRequest) {
        throw new ApiError(
            StatusCodes.FAILED_DEPENDENCY,
            "Something was problem on delivery request oparation!"
        )
    };
    if (!order) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "We don't found the order!"
        )
    };

    const notification = await Notification.create({
        for: order.provider,
        content: `You delivery time extends request approved by ${order.customer.fullName}`
    });

    //@ts-ignore
    const io = global.io;
    io.emit(`socket:${ order.provider }`,notification)

    return true;
}

const providerAccountVerification = async (
    user: JwtPayload,
    images: string[],
    doc: string
) => {
    const { userID } = user;

    const isUser = await User.findById(userID);
    if (!isUser) {
        throw new ApiError(
            StatusCodes.NOT_FOUND, 
            "User not exist!"
        );
    }

    if (
        isUser.accountStatus === ACCOUNT_STATUS.DELETE ||
        isUser.accountStatus === ACCOUNT_STATUS.BLOCK
    ) {
        throw new ApiError(
            StatusCodes.FORBIDDEN, 
            `Your account was ${isUser.accountStatus.toLowerCase()}!`
        );
    };

    if (
        !images || 
        images.length < 1 || 
        !doc 
    ) {
        throw new ApiError(
            StatusCodes.BAD_GATEWAY, 
            "You should provide all documents!"
        );
    };

    if (!isUser.isVerified) {
        isUser.isVerified.images = []
        isUser.isVerified.doc = ""
    };

    isUser.isVerified.doc = doc;
    isUser.isVerified.images.push(...images);
    
    if (
        isUser.isVerified.trdLicense &&
        isUser.isVerified.images.length > 0
    ) {
        isUser.isVerified.status = ACCOUNT_VERIFICATION_STATUS.WAITING
    };

    await Verification.create({
        user: isUser._id,
        doc,
        image: images
    })

    const admins = await User.find({ 
        role: {
            $in: [ USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN ]
        } 
    })
    
    //@ts-ignore
    const io = global.io;
    admins.forEach( async ( e: any ) => {
        const notification = await Notification.create({
            for: e._id,
            content: `${isUser.fullName}`
        });
        
        io.emit(`socket:${ e._id }`, notification)
    })

    await isUser.save();

    return true;
}

const verificationData = async (
    payload: JwtPayload
) => {
    const { userID } = payload;
    const user = await User.findById(userID);
    if (!user) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "User not founded!"
        )
    };

    return user.isVerified
}

export const ProviderService = {
    deliveryRequest,
    singleOrder,
    AllOrders,
    dOrder,
    verificationData,
    getDeliveryReqests,
    reqestAction,
    DelivaryRequestForTimeExtends,
    providerAccountVerification,
    AllCompletedOrders,
    ADeliveryReqest,
    deliveryTimeExtendsRequest,
    getDeliveryTimeExtendsRequest,
    getADeliveryTimeExtendsRequest
}