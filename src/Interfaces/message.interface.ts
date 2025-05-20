import { Document, Types } from 'mongoose';

export interface IMessage extends Document {
  sender: Types.ObjectId;
  chatID: Types.ObjectId;
  message: string;
  messageType: string;
  image?: string;
}