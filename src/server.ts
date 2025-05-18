import chalk from "chalk";
import { errorLogger, logger } from "./shared/logger";
import DBConnection from "./DB/ConnentDB";
import config from "./config";
import app from "./index";
import { socketHelper } from "./helpers/socketHelper";
import { Server } from "socket.io";
import { superUserCreate } from "./DB/SuperUserCreate";


//uncaught exception
process.on('uncaughtException', error => {
  errorLogger.error('UnhandleException Detected', error);
  process.exit(1);
});

let server: any;
async function main() {
    try {

        await DBConnection()
        .then( response =>(
            console.log(chalk.green("✅ Your Database was hosted on: ") + chalk.cyan(response.connection.host)),
            console.log(chalk.green("✅ Your Database is running on port: ") + chalk.yellow(response.connection.port)),
            console.log(chalk.green("✅ Your Database name is: ") + chalk.magenta(response.connection.name))
        ));

        await superUserCreate();

        const port = 
            typeof config.port === 'number'?
                config.port 
                    :
                Number(config.port)

        server = app.listen(port, config.ip_address as string,()=>{
            logger.info(
                chalk.yellow(`♻️  Application listening on port:${config.port}`)
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
        errorLogger.error(chalk.red('🤢 Failed to connect Database'));
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
