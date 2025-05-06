import { Document, Types } from "mongoose";

export interface IOrder extends Document{
    customer: Types.ObjectId,
    deliveryDate: Date,
    totalPrice: number,
    serviceProvider: Types.ObjectId
    submittedForApprovalOn: Date | boolean,
    serviceProviderAcceptationOn: Date | boolean,
    paymentEstimatedOn: Date | boolean,
    isProgressDone: Boolean
} 