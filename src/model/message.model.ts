import { model, models, Schema } from "mongoose";
import { IMessage } from "../Interfaces/message.interface";
import { MESSAGE_TYPE } from "../enums/message.enum";

const messageSchema = new Schema<IMessage>({
  sender:{
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  chatRef:{
    type: Schema.Types.ObjectId,
    ref:"chats"
  },
  messageType: {
    type: String,
    enum: MESSAGE_TYPE,
    default: MESSAGE_TYPE.CHAT
  },
  content:{
    type: String,
    required: true
  }
},{
  timestamps: true
});

const Message = models.Order || model('message', messageSchema);
export default Message;