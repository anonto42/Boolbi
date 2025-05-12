import { Document, Types } from "mongoose";

export interface IChat extends Document {
    chatName: string;
    image: string;
    firstUser: Types.ObjectId;
    secondUser: Types.ObjectId;
    lastMessage: Types.ObjectId;
}