import { JwtPayload } from "jsonwebtoken"
import User from "../../model/user.model";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { ACCOUNT_STATUS } from "../../enums/user.enums";
import Chat from "../../model/chat.model";
import mongoose from "mongoose";
import { NChat } from "../../types/message";
import Post from "../../model/post.model";
import Message from "../../model/message.model";


const sendMessageSend = async (
    payload: JwtPayload,
    data:{ message: string, chatRoom: string },
    image: string
) => {
    const { userID } = payload;
    const { message, chatRoom } = data;
    const isUser = await User.findById(userID);
    if (!isUser) {
        throw new ApiError(StatusCodes.NOT_FOUND,`No account exists!`)
    };
    if ( isUser.accountStatus === ACCOUNT_STATUS.DELETE || isUser.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUser.accountStatus.toLowerCase()}!`)
    };
    
    const newMessage = {
        sender:isUser._id,
        chatRef: chatRoom,
        content: image? image : message
    }

    try {
        let message = await Message.create(newMessage);
        message = await message.populate("sender","profileImage fullName").execPopulate();
        message = await message.populate("chatRef").execPopulate();
        message = await User.populate(message,{
            path:"chatRef.users",
            select: "fullName profileImage email"
        })

        await Chat.findByIdAndUpdate(chatRoom,{
            lastMessage: message
        })
        
    } catch (error) {
        console.log(error)
    }
    
}

const getSingleChatRoom = async (
    payload: JwtPayload,
    roomID: string,
    postID: string
) => {
    const { userID } = payload;
    const isUser = await User.findById(userID);
    if (!isUser) {
        throw new ApiError(StatusCodes.NOT_FOUND,`No account exists!`)
    };
    if ( isUser.accountStatus === ACCOUNT_STATUS.DELETE || isUser.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUser.accountStatus.toLowerCase()}!`)
    };
    const post = await Post.findById(postID);
    if (!post) {
        throw new ApiError(StatusCodes.FAILED_DEPENDENCY,"The service was not avable on this time")
    }
    
    const chatRoom = await Chat.aggregate([
        {
            $match: { _id: roomID }
        },
        {
            $lookup: {
            from: "users", // populating firstUser
            localField: "firstUser",
            foreignField: "_id",
            as: "firstUser"
            }
        },
        {
            $unwind: "$firstUser"
        },
        {
            $lookup: {
            from: "users", // populating secondUser
            localField: "secondUser",
            foreignField: "_id",
            as: "secondUser"
            }
        },
        {
            $unwind: "$secondUser"
        },
        {
            $lookup: {
            from: "messages", // joining all messages with chat._id
            localField: "_id",
            foreignField: "chatRef",
            as: "messages"
            }
        },
        {
            $lookup: {
            from: "messages", // populating lastMessage
            localField: "lastMessage",
            foreignField: "_id",
            as: "lastMessage"
            }
        },
        {
            $unwind: {
            path: "$lastMessage",
            preserveNullAndEmptyArrays: true
            }
        }
    ])

    if ( chatRoom.length > 0 ) {
        return chatRoom[0];
    }else{
        return createChatRoom(payload, { chatWith: post.creatorID, chatName: post.title, image: post.coverImage })
    }

}

const chatRooms = async (
    payload: JwtPayload
) => {
    const { userID } = payload;
    const isUser = await User.findById(userID);
        if (!isUser) {
            throw new ApiError(StatusCodes.NOT_FOUND,`No account exists!`)
        };
        if ( isUser.accountStatus === ACCOUNT_STATUS.DELETE || isUser.accountStatus === ACCOUNT_STATUS.BLOCK ) {
            throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUser.accountStatus.toLowerCase()}!`)
        };

    
    const userId = new mongoose.Types.ObjectId(isUser._id);
    const userRooms = {
            $or: [
                { firstUser: userId },
                { secondUser: userId }
            ]
        };
    const chats = await Chat.find(userRooms);

    return chats;
}

const createChatRoom = async (
    payload: JwtPayload,
    data: NChat
) => {
    const { userID } = payload;
    const { chatWith, chatName, image } = data;
    const isUser = await User.findById(userID);
    const isSecondPerson = await User.findById(chatWith);
    if (!isUser || !isSecondPerson) {
        throw new ApiError(StatusCodes.NOT_FOUND,`No account exists to create the chat room!`)
    };
    if ( isUser.accountStatus === ACCOUNT_STATUS.DELETE || isUser.accountStatus === ACCOUNT_STATUS.BLOCK || isSecondPerson.accountStatus === ACCOUNT_STATUS.DELETE || isSecondPerson.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUser.accountStatus.toLowerCase()}!`)
    };
    
    const newChat = {
        secondUser: isSecondPerson._id,
        firstUser: isSecondPerson._id,
        chatName,
        image
    };

    const chat = await Chat.create(newChat);
    
    return chat
}

export const MessageService = {
    sendMessageSend,
    chatRooms,
    getSingleChatRoom,
    createChatRoom
}