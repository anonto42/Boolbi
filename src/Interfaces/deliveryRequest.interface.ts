import { Document, Types } from "mongoose";

export interface IDR extends Document {
    orderID: Types.ObjectId,
    for: Types.ObjectId,
    projectDoc: string,
    requestType: string,
    uploatedProject: string,
    nextExtendeDate: Date,
    pdf: string,
    images: string[],
    requestStatus: string,
}