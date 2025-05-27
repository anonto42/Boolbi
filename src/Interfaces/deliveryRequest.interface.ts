import { Document, Types } from "mongoose";

export interface IDR extends Document {
    orderID: Types.ObjectId,
    for: Types.ObjectId,
    projectDoc: string,
    uploatedProject: string,
    pdf: string,
    images: string[],
    requestStatus: string,
}