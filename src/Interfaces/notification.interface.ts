import { Document, Types } from "mongoose";

export interface INotification extends Document {
    for: Types.ObjectId;
    content: string;
    notiticationType: "DELIVERY_REQUEST" | "OFFER" | "NOTIFICATION";
    data: {
        title: string,// offer
        offerId: Types.ObjectId, // offer
        image: string,// offer
        orderId: Types.ObjectId, // request
        requestId: Types.ObjectId // request
    }
}