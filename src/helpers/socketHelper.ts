import colors from 'colors';
import { Server } from 'socket.io';
import { logger } from '../shared/logger';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const socket = (io: Server) => {
  io.on('connection', socket => {
    const joinedRooms = new Set<string>();

    socket.on("send message",async ({roomID,user,message})=>{
      try {
        if (!roomID || !user || !message) {
          throw new ApiError(StatusCodes.BAD_REQUEST,"Missing required fields");
        }
        if (!joinedRooms.has(roomID)) {
          socket.join(roomID);
          joinedRooms.add(roomID);
          console.log(`User (${user}) joined room: ${roomID}`);
        }

        io.to(roomID).emit("receive message", {
          roomID,
          user,
          message,
          createdAt: new Date(),
        });
      } catch (err) {
        if (err instanceof Error) {
          console.log("send message error:", err.message);
        } else {
          console.log("Unknown error:", err);
        }
      }
    });

    socket.on("notification", async ({ roomID, userName, message, iconImage }) => {
      try {
        if (!roomID || !userName || !message) {
          throw new ApiError(StatusCodes.BAD_REQUEST,"Missing required fields for notification");
        }

        if (!joinedRooms.has(roomID)) {
          socket.join(roomID);
          joinedRooms.add(roomID);
        }

        io.to(roomID).emit("receive notification", {
          roomID,
          userName,
          message,
          iconImage,
          createdAt: new Date(),
        });
      } catch (err) {
        if (err instanceof Error) {
          console.log("notification error:", err.message);
        } else {
          console.log("Unknown error:", err);
        }
      }
    });

    //disconnect
    socket.on('disconnect', () => {
      logger.info(colors.red('A user disconnect'));
    });
  });
};

export const socketHelper = { socket };

//@ts-ignore
export const io = global.io;