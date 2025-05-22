import { Document, Types } from "mongoose";

export interface IChat extends Document {
    chatName: string;
    image?: string;
    status: string;
    users: Types.ObjectId[];
    lastMessage: Types.ObjectId;
}