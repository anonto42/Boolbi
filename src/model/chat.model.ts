import { model, models, Schema } from "mongoose";
import { IChat } from "../Interfaces/chat.interface";

const chatSchema = new Schema<IChat>({
    chatName:{
        type: String,
        required: true
    },
    image:{
        type: String
    },
    status: {
        type: String
    },
    users: [{
        type: Schema.Types.ObjectId,
        ref:"user"
    }],
    lastMessage:{
        type: Schema.Types.ObjectId,
        ref:"message"
    }
},{
    timestamps: true
})

const Chat = models.Chat || model<IChat>('chat', chatSchema);
export default Chat;