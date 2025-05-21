import { Document, Types } from "mongoose";

export interface IOrder extends Document{
    deliveryDate: Date,
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