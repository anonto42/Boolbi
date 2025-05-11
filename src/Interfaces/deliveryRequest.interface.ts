import { Document, Types } from "mongoose";

export interface IDR extends Document {
    orderID: Types.ObjectId,
    customer: Types.ObjectId,
    projectDoc: string,
    uploatedProject: string,
    pdf: string,
    projectImage: string,
    requestStatus: string,
}