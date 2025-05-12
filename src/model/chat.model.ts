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
    firstUser:{
        type: Schema.Types.ObjectId,
        ref:"users"
    },
    secondUser:{
        type: Schema.Types.ObjectId,
        ref:"users"
    },
    lastMessage:{
        type: Schema.Types.ObjectId,
        ref:"messages"
    }
},{
    timestamps: true
})

const Chat = models.Chat || model('chat', chatSchema);
export default Chat;