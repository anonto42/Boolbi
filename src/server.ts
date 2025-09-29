import colors from "colors";
import { errorLogger, logger } from "./shared/logger";
import config from "./config";
import app from "./index";
import { socketHelper } from "./helpers/socketHelper";
import { Server } from "socket.io";
import { superUserCreate } from "./DB/SuperUserCreate";
import mongoose from "mongoose";


//uncaught exception
process.on('uncaughtException', error => {
  errorLogger.error('UnhandleException Detected', error);
  process.exit(1);
});

let server: any;
async function main() {
    try {

        let response: any = {};
        await mongoose.connect(`mongodb://${config.database_user_name}:${config.database_user_password}@mongo:${config.database_port}/${config.database_name}?authSource=admin`)
        .then( rep => response = rep )
        .catch( err => console.log( err ))
        console.log(colors.green("✅ Your Database was hosted on: ") + colors.cyan(response.connection.host)),
        console.log(colors.green("✅ Your Database is running on port: ") + colors.yellow(response.connection.port)),
        console.log(colors.green("✅ Your Database name is: ") + colors.magenta(response.connection.name))

        await superUserCreate();

        const port = 
            typeof config.port === 'number'?
                config.port 
                    :
                Number(config.port)

        server = app.listen(port, config.ip_address as string,()=>{
            logger.info(
                colors.yellow(`♻️  Application listening on port:${config.port}`)
            );
        });

        //socket
        const io = new Server(server, {
        pingTimeout: 60000,
        cors: {
            origin: '*',
        },
        });
        socketHelper.socket(io);
        //@ts-ignore
        global.io = io;
        
    } catch (error) {
        errorLogger.error(colors.red('🤢 Failed to connect Database'));
    }

    //handle unhandleRejection
    process.on('unhandledRejection', error => {
        if (server) {
            server.close(() => {
                errorLogger.error('UnhandleRejection Detected', error);
                process.exit(1);
            });
        } else {
            process.exit(1);
        }
    });
}

main();

//SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM IS RECEIVE');
  if (server) {
    server.close();
  }
});
