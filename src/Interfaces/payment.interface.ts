import { Document, Types } from "mongoose";
import { PAYMENT_STATUS } from "../enums/payment.enum";

export interface IPayment extends Document{
    userId: Types.ObjectId,
    orderId: Types.ObjectId,
    amount: number,
    commission: number,
    status: PAYMENT_STATUS
}