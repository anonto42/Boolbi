import { model, models, Schema } from "mongoose";
import { IMessage } from "../Interfaces/message.interface";

const messageSchema = new Schema<IMessage>({
  sender:{
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  receiver:{
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  content:{
    type: String,
    trim: true,
    max: 1400
  },
  image:[{
    type: String
  }]
});

const Message = models.Order || model('message', messageSchema);
export default Message;