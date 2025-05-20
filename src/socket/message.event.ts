import { Types } from "mongoose";
import { messageService } from "../app/service/message.service";
import { MESSAGE_TYPE } from "../enums/message.enum";
import { chatService } from "../app/service/chat.service";


interface IMessageData {
    chat: Types.ObjectId;
    message: string;
    type: MESSAGE_TYPE;
    sender: Types.ObjectId;
    image?: string; 
}

export const handleMessageEvents = async (
    socket: any,
    data: IMessageData,
    callBack: any,
    io: any
) => {
    try {
        const chatID = new Types.ObjectId(data.chat);
        const senderID = new Types.ObjectId(data.sender);

        const message = await messageService.addMessage({
            chatID: chatID,
            message: data.message,
            messageType: data.type,
            sender: senderID,
            image: data.image
        });

        if (message && message._id) {
            const populateMessage: any = await messageService.getMessageById( message._id );
            
            if ( populateMessage.chatID && populateMessage.chatID.participants ) {
                const participants = populateMessage.chatID.participants;
                const chat_id = data.chat ? data.chat.toString() : "unknown";
                const chatRoom = "new-message::" + chat_id

                socket.broadcast.emit(chatRoom, message);

                const eventName1 = "update-chatlist::" + participants[0].toString();
                const eventName2 = "update-chatlist::" + participants[1].toString();

                const chatListRorUser1 = await chatService.getChatByParticipantId( 
                    { participantId: participants[0] },
                    { page: 1, limit: 10 },
                );

                const chatListRorUser2 = await chatService.getChatByParticipantId(
                    { participantId: participants[1] },
                    { page: 1, limit: 10 },
                );

                io.emit(eventName1, chatListRorUser1);
                io.emit(eventName2, chatListRorUser2);

                callBack({
                    status: "Success",
                    message: message.message
                });
            } else {
                callBack({
                    status: "Error",
                    message: "Chat does not have participants."
                });
            };
        } else {
            callBack({
                status: "Error",
                message: "Failed to create message."
            });
        };
    } catch (error: any) {
        console.error("Error handling message events: ",error);
        callBack({
            status: "Error",
            message: error.message || "An error occureed"
        });
    };
};