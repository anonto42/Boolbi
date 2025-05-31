import { Document, Types } from "mongoose"

export interface ISupport extends Document {
    for: Types.ObjectId;
    catagory: string;
    status: "PENDING" | "SOLVED";
    message: string;
    adminReply: string;
}