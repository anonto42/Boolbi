import { model, models, Schema } from "mongoose";
import { IMessage } from "../Interfaces/message.interface";
import { MESSAGE_TYPE } from "../enums/message.enum";

const messageSchema = new Schema<IMessage>({
  sender:{
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  chatID:{
    type: Schema.Types.ObjectId,
    ref:"chat"
  },
  messageType: {
    type: String,
    enum: MESSAGE_TYPE,
    default: MESSAGE_TYPE.MESSAGE
  },
  message:{
    type: String
  },
  image:{
    type: String
  }
},{
  timestamps: true
});

const Message = models.Message || model<IMessage>('message', messageSchema);
export default Message;