import { Document, Types } from 'mongoose';

export interface IMessage extends Document {
  sender: Types.ObjectId;
  chatRef: Types.ObjectId;
  content: string;
  messageType: string;
}