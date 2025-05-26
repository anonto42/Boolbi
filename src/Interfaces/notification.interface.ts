import { Document, Types } from "mongoose";

export interface INotification extends Document {
    for: Types.ObjectId;
    content: string;
}