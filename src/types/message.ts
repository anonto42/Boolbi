import { MESSAGE_TYPE } from "../enums/message.enum";



export type NChat = {
    chatName: string,
    image: string,
    chatWith: string
}

export type socketMessage = {
    sender?: string;
    chatId?: string;
    message: string;
    offer?: string;
    messageType: MESSAGE_TYPE;
    image: string;
}

/**{
    sender: user._id,
    chatID: chat._id,
    message: image ? image : messageBody.content,
    messageType: messageBody.messageType
  } */