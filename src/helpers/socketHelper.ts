import colors from 'colors';
import { Server, Socket } from 'socket.io';
import { logger } from '../shared/logger';
import { handleChatEvents } from '../socket/chat.event';
import { handleMessageEvents } from '../socket/message.event';

const socket = (io: Server) => {
  io.on('connection', (socket: Socket) => {

    try {

      socket.on("add-new-chat", (data, callback) => {
        console.log(data)
        console.log(callback)
        if (typeof callback !== "function") {
          console.error("Callback is not a function");
          return;
        }
        handleChatEvents(socket, data, callback)
      });

      socket.on("add-new-message",(data, callback) => (
        handleMessageEvents(socket, data, callback, io)
      ));
      
      socket.on("announcement",data =>{});

    } catch (error) {
      console.log(error)
    }
    
  
    socket.on('disconnect', () => {
      logger.info(colors.red('A user disconnected'));
    });

  });
};

export const socketHelper = { socket };
