import colors from 'colors';
import { Server } from 'socket.io';
import { logger } from '../shared/logger';

const socket = (io: Server) => {
  io.on('connection', socket => {
    logger.info(colors.blue('A user connected'));

    socket.on("send message",async ({roomID,user,message})=>{
      try {
        socket.join(roomID);

        console.log(`User (${user}) joined room: ${roomID}`);
        console.log("Message: " + message);

        io.to(roomID).emit("receive message", {
          roomID,
          user,
          message,
          createdAt: new Date(),
        });
      } catch (err) {
        if( err instanceof Error){
          console.log(err)
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
