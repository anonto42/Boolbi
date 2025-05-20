import mongoose from "mongoose";
import Chat from "../../model/chat.model"


export const createChat = async (userID: any, chatInfo: {chatName: string, image: string}, participant: any) => {
    const newChat = new Chat({
        chatName: chatInfo.chatName,
        image: chatInfo.image,
        participants: [userID, participant]
    });
    const savedChat = await newChat.save();
    return await savedChat.populate({
        path: "participants",
        match: { _id: { $ne: userID }}
    });
};

export const getChatById = async ( id: string ) => {
    return await Chat.findById(id);
};

export const getChatByParticipants = async ( userID: any, participant: any) => {
    const chat = await Chat.findOne({
        participants: { $all: [userID, participant] }
    }).populate({
        path: "participants",
        match: { _id: { $ne: userID } }
    });
    return chat;
};

export const getChatDetailsByParticipantId = async (
  userID: any,
  participant?: any,
) => {
  const chat = await Chat.findOne({
    participants: { $all: [userID, participant] },
  });
  return chat;
};

export const deleteChatList = async (chatId: any) => {
  return await Chat.findByIdAndDelete(chatId);
};

export const getChatByParticipantId = async (filters: { participantId: string, name?: string}, options: { page: any, limit: any }) => {
  // // console.log(filters, options);
  // console.log('filters ----', filters);
  try {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const skip = (page - 1) * limit;
 
    const participantId = new mongoose.Types.ObjectId(filters.participantId);
    // console.log('participantId===', participantId);
 
    const name = filters.name || '';
 
    // console.log({ name });
 
    const allChatLists = await Chat.aggregate([
      { $match: { participants: participantId } },
      {
        $lookup: {
          from: 'messages',
          let: { chatId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$chat', '$$chatId'] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            { $project: { message: 1, createdAt: 1 } },
          ],
          as: 'latestMessage',
        },
      },
      { $unwind: { path: '$latestMessage', preserveNullAndEmptyArrays: true } },
      { $sort: { 'latestMessage.createdAt': -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'participants',
          foreignField: '_id',
          as: 'participants',
        },
      },
 
      {
        $addFields: {
          participants: {
            $map: {
              input: {
                $filter: {
                  input: '$participants',
                  as: 'participant',
                  cond: { $ne: ['$$participant._id', participantId] },
                },
              },
              as: 'participant',
              in: {
                _id: '$$participant._id',
                fullName: '$$participant.fullName',
                image: '$$participant.image',
              },
            },
          },
        },
      },
      {
        $match: {
          participants: {
            $elemMatch: {
              fullName: { $regex: name },
            },
          },
        },
      },
      {
        $addFields: {
          participant: { $arrayElemAt: ['$participants', 0] },
        },
      },
      {
        $project: {
          latestMessage: 1,
          groupName: 1,
          type: 1,
          groupAdmin: 1,
          image: 1,
          participant: 1,
        },
      },
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);
 
    // console.log('allChatLists');
    // console.log(allChatLists);
 
    const totalResults =
      allChatLists[0]?.totalCount?.length > 0
        ? allChatLists[0]?.totalCount[0]?.count
        : 0;
 
    const totalPages = Math.ceil(totalResults / limit);
    const pagination = { totalResults, totalPages, currentPage: page, limit };
 
    // return { chatList: allChatLists, pagination };
    return { chatList: allChatLists[0]?.data, pagination };
    // return allChatLists;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
 
export const getMyChatList = async (userId: any) => {
  const myId = new mongoose.Types.ObjectId(userId);
  const result = await Chat.aggregate([
    { $match: { participants: { $in: [myId] } } },
    // { $unwind: '$participants' },
    // { $match: { participants: { $ne: myId } } },
    // {
    //   $group: {
    //     _id: null,
    //     participantIds: { $addToSet: '$participants' },
    //   },
    // },
  ]);
  return result;
};

export const chatService = {
  createChat,
  getChatById,
  getChatByParticipants,
  getChatDetailsByParticipantId,
  deleteChatList,
  getChatByParticipantId,
  getMyChatList,
};