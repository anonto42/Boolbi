import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import mongoose, { Types } from "mongoose";
import Message from "../../model/message.model";
import { MESSAGE_TYPE } from "../../enums/message.enum";

const addMessage = async (messageBody: {
    sender: any;
    chatID: any
    message: string;
    messageType: MESSAGE_TYPE;
    image?: string;
}) => {
    const newMessage = await Message.create(messageBody);
    return await newMessage.populate("chatID sender")
}

const getMessages = async (chatId: any, options: {limit?: number; page?: number}) => {
  const { limit = 10, page = 1 }: { limit?: number; page?: number } = options;
 
  try {
    const totalResults = await Message.countDocuments({ chat: chatId });
    const totalPages = Math.ceil(totalResults / limit);
    const pagination = { totalResults, totalPages, currentPage: page, limit };
 
    // console.log([chatId]);
 
    const skip = (page - 1) * limit;
    const chat = new mongoose.Types.ObjectId(chatId);
 
    const messages = await Message.aggregate([
      { $match: { chat: chat } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'user',
          localField: 'sender',
          foreignField: '_id',
          as: 'sender',
        },
      },
      { $unwind: '$sender' },
      {
        $lookup: {
          from: 'chat',
          localField: 'chatID',
          foreignField: '_id',
          as: 'chatDetails',
        },
      },
      { $unwind: '$chatDetails' },
      {
        $project: {
          _id: 1,
          chat: 1,
          message: 1,
          type: 1,
          sender: {
            _id: 1,
            fullName: 1,
            image: 1,
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
 
    // console.log('messages', messages);
 
    return { messages, pagination };
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
  const result = await Message.deleteMany({ chat: chatId });
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