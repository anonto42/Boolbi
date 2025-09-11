import { Document, Types } from "mongoose"

export interface ISupport extends Document {
    for: Types.ObjectId;
    isImage: boolean;
    category: string;
    status: "PENDING" | "SOLVED";
    message: string;
    image: string;
    isAdmin: boolean
    adminReply: string;
}