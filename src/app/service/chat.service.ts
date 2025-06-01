import Chat from "../../model/chat.model"
import User from "../../model/user.model";
import { StatusCodes } from "http-status-codes";
import { ACCOUNT_STATUS } from "../../enums/user.enums";
import ApiError from "../../errors/ApiError";

const createChat = async (
  sender: any, 
  chatInfo: {
    receiver: any,
    chatName: string, 
    image: string
  }, 
) => {

  const isUser = await User.findById(sender);
  const isRecever = await User.findById( chatInfo.receiver );
  
  if (!isRecever) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Receiver not found");
  };

  if (!isUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  };
  
  if (
    isRecever.accountStatus === ACCOUNT_STATUS.DELETE ||
    isRecever.accountStatus === ACCOUNT_STATUS.BLOCK
  ) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        `Your account was ${isRecever.accountStatus.toLowerCase()}!`
      );
  };

  if (
    isUser.accountStatus === ACCOUNT_STATUS.DELETE ||
    isUser.accountStatus === ACCOUNT_STATUS.BLOCK
  ) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        `Your account was ${isUser.accountStatus.toLowerCase()}!`
      );
  };

  const isChatExist = await Chat.findOne({
    users: { $all:[ sender, chatInfo.receiver ] }
  }).populate("users","email fullName")


  if (!isChatExist) {
    const chatRoom = await Chat.create({
      chatName: chatInfo.chatName,
      image: chatInfo.chatName,
      users: [
        sender,
        chatInfo.receiver
      ]
    });

    return await chatRoom.populate("users","email fullName");
  }

  return isChatExist
  
};

const getChatById = async ( id: string ) => {
  return await Chat.findById(id).populate("users","fullName email");
};

const allChats = async (id: string, page = 1, limit = 10) => {
  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
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

  // Calculate how many documents to skip
  const skip = (page - 1) * limit;

  // Fetch paginated chats
  const chats = await Chat.find({
    users: { $in: [id] }
  })
    .populate("users", "email fullName")
    .skip(skip)
    .limit(limit);

  // Optionally, you may want to return total count for pagination UI
  const totalChats = await Chat.countDocuments({
    users: { $in: [id] }
  });

  return {
    chats,
    totalChats,
    currentPage: page,
    totalPages: Math.ceil(totalChats / limit),
  };
};

const deleteChat = async ( userID: string, id: string ) => {
  const user = await User.findById(userID);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
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

  const chatRoom = await Chat.findById(id);
  if (!chatRoom) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      `Chat not founded!`
    ); 
  };

  const isInChat = chatRoom.users.filter( ( e: any ) => e === user._id );
  if (!isInChat) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `You are not a member of this chat so you can delete this chat`
    );
  };

  await Chat.deleteOne({ _id: chatRoom._id });

  return true

};

export const chatService = {
  createChat,
  getChatById,
  allChats,
  deleteChat
};