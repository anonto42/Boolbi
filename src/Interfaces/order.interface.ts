import { Document, Types } from "mongoose";

export interface IOrder extends Document{
    deliveryDate: Date,
    offerID: Types.ObjectId,
    customer: Types.ObjectId,
    provider: Types.ObjectId,
    deliveryRequest: {
        isRequested: boolean,
        requestID: Types.ObjectId
    },
    trackStatus: {
            isComplited:{
            date: Date,
            status: boolean
        },
        orderCreated:{
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