import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import mongoose, { Types } from "mongoose";
import Message from "../../model/message.model";
import { MESSAGE_TYPE } from "../../enums/message.enum";
import { JwtPayload } from "jsonwebtoken";
import User from "../../model/user.model";
import Chat from "../../model/chat.model";
import { ACCOUNT_STATUS } from "../../enums/user.enums";
import { socketHelper } from "../../helpers/socketHelper";
import { socketMessage } from "../../types/message";

const addMessage = async (
  payload: JwtPayload,
  messageBody: {
    chatID: string;
    content: string;
    messageType: MESSAGE_TYPE;
  },
  image?: string
) => {
  const { userID } = payload;
  const user = await User.findById(userID);
  const chat = await Chat.findById(messageBody.chatID);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "user not found");
  }

  if (!chat) {
    throw new ApiError(StatusCodes.NOT_FOUND, "chat not found");
  }

  if (
    user.accountStatus === ACCOUNT_STATUS.DELETE ||
    user.accountStatus === ACCOUNT_STATUS.BLOCK
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      `Your account was ${user.accountStatus.toLowerCase()}!`
    );
  }

  const message = await Message.create({
    sender: user._id,
    chatID: chat._id,
    message: image ? image : messageBody.content,
    messageType: messageBody.messageType
  });

  const populatedMessage = await message.populate("sender", "fullName email");

  //@ts-ignore
  const io = global.io;

  const socketMessage: socketMessage = {
    message: message.message,
    messageType: MESSAGE_TYPE.MESSAGE,
    chatId: message.chatID,
    sender: message.sender
  }

  // Emit the message to all users in the chat except the sender
  for (const userId of chat.users) {
    if (userId.toString() !== userID) {
      const targetSocketId = socketHelper.connectedUsers.get(userId.toString());
      if (targetSocketId) {
        io.to(targetSocketId).emit(`socket:${userId}`, socketMessage);
      }
    }
  }

  return populatedMessage;
};

const getMessages = async (
  chatId: any, 
  userID: any,
  options: {
    limit?: number; 
    page?: number
  }
) => {
  const { limit = 10, page = 1 }: { limit?: number; page?: number } = options;
  const user = await User.findById(userID);
  if (!user) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "User not founded"
    )
  };
  
  if (
    user.accountStatus === ACCOUNT_STATUS.DELETE ||
    user.accountStatus === ACCOUNT_STATUS.BLOCK
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      `Your account was ${user.accountStatus.toLowerCase()}!`
    );
  };
 
  try {
    const totalResults = await Message.countDocuments({ chat: chatId });
    const totalPages = Math.ceil(totalResults / limit);
    const pagination = { totalResults, totalPages, currentPage: page, limit };
 
    const skip = (page - 1) * limit;
    const chat = new mongoose.Types.ObjectId(chatId);
 
    const messages = await Message.aggregate([
      { $match: { chatID: chat } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      // { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'sender',
          foreignField: '_id',
          as: 'sender',
        },
      },
      { $unwind: '$sender' },
      // {
      //   $lookup: {
      //     from: 'chat',
      //     localField: 'chatID',
      //     foreignField: '_id',
      //     as: 'chatDetails',
      //   },
      // },
      // { $unwind: '$chatDetails' },
      {
        $project: {
          _id: 1,
          // chat: 1,
          message: 1,
          type: 1,
          sender: {
            _id: 1,
            fullName: 1,
            image: 1,
            email: 1
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
 
 
    return { 
      messages, 
      pagination 
    };
  } catch (error) {
    throw new ApiError(
      StatusCodes.EXPECTATION_FAILED,
      'Failed to retrieve messages'
    );
  }
};

const getMessageById = async (messageId: Types.ObjectId) => {
  return Message.findById(messageId).populate('chatID');
};

const deleteMessage = async (id: string) => {
  const result = await Message.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Message not found');
  }
  return result;
};

const deleteMessagesByChatId = async (chatId: string) => {
  const result = await Message.deleteMany({ chatID: chatId });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete messages');
  }
  return result;
};

export const messageService = {
  addMessage,
  getMessageById,
  getMessages,
  deleteMessage,
  deleteMessagesByChatId,
};