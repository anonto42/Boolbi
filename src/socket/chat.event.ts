import { chatService } from "../app/service/chat.service";

interface IData {
    userId: string;
    participant: string;
    chatName: string;
    image: string;
}

export const handleChatEvents = async (
    socket: any,
    data: IData,
    callback: any
) => {
    try {

        if (!data.participant || !data.userId) {
            callback({
                status: "Error",
                message: "Please provide both participant and userId"
            });
            return;
        };

        let chat = {};

        if (data.participant && data.userId) {
            const existingChat = await chatService.getChatByParticipants( data.userId, data.participant );
            console.log(existingChat)
            console.log("This is the callback funciton + ",callback)
            if ( existingChat && existingChat.status === "accepted") {
                callback({
                    status: "Success",
                    chatId: existingChat._id,
                    message: "Chat already exists"
                });
                return;
            }
            chat = await chatService.createChat(data.userId, {chatName: data.chatName, image: data.image}, data.participant);

            if ( chat && "_id" in chat) {
                callback({
                    status: "Success",
                    chatID: chat._id,
                    message: "Chat created successfully"
                });
                return
            } else {
                console.error('❌ Error: Chat creation failed!', chat);
                callback({
                status: 'Error',
                message: 'Failed to create chat',
                });
            }
        } else {
            callback({
                status: 'Error',
                message: 'Must provide at least 2 participants',
            });
        }
        
    } catch (error: any) {
        console.log(error);
        callback({ status: 'Error', message: error.message });
    }
}