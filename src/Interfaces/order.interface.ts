import { Document, Types } from "mongoose";

export interface IOrder extends Document{
    customer: Types.ObjectId,
    deliveryDate: Date,
    totalPrice: number,
    serviceProvider: Types.ObjectId,
    offerID: Types.ObjectId
    deliveryRequest: {
        isRequested: boolean,
        requestID: Types.ObjectId
    },
    trackStatus: {
        submiteForAdminApproval:{
            date: Date,
            status: boolean
        },
        approval:{
            date: Date,
            status: boolean
        },
        paymentProcessed:{
            date: Date,
            status: boolean
        },
    },
    isProgressDone: boolean
} 