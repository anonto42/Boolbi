import colors from 'colors';
import { Server, Socket } from 'socket.io';
import { logger } from '../shared/logger';

const connectedUsers = new Map<string, string>();

const socket = (io: Server) => {
  io.on('connection', (socket: Socket) => {

    try {

      socket.on('register', (userId: string) => {
        connectedUsers.set(userId, socket.id);
        logger.info(colors.cyan(`User ${userId} connected with socket ${socket.id}`));
      });
      
    } catch (error) {
      console.log( "This error is form the socket :=> " + error )
    }
  
    socket.on('disconnect', () => {
      logger.info(colors.red('A user disconnected'));
    });

  });
};

export const socketHelper = { socket, connectedUsers };
