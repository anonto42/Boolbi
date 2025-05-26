import { Document, Types } from "mongoose";

export interface INotification extends Document {
    user: Types.ObjectId;
    for: Types.ObjectId;
    content: string;
}