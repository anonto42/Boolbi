import express from "express";
import cors from 'cors';
import cookie from 'cookie-parser';
import session from "express-session";
import dotenv from "dotenv";
import router from "./routes/index.route";
import DBConnection from "./DB/ConnentDB";
import chalk from 'chalk';
import globalErrorHandler from "./middlewares/globalErrorHandler";
import { Morgan } from "./shared/morgen";
import passport from "./helpers/OAuth.strategy"

// Initializing
const app = express();
const port = process.env.PORT || 3000;
const origin = process.env.ORIGIN || "*";

//Env config
dotenv.config({
  path:"./.env"
})

//Morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

//Body parser
app.use(cookie())
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({
  origin: origin,
  credentials: true
}));

// Sesstion
app.use(
  session({
    secret: process.env.SESSION_SECRET! || "default_secret",
    resave: false,
    saveUninitialized: true
  })
)

//Passport
// app.use(passport.initialize());
// app.use(passport.session());

//Api endpoints
app.use("/api/v1",router)

//File retrieve
app.use(express.static("uploads"));

// global error
app.use(globalErrorHandler)

// connect DB & run the surver
;( 
  async () => {
    await DBConnection()
      .then( response =>(
          console.log(chalk.green("✅ Your Database was hosted on: ") + chalk.cyan(response.connection.host)),
          console.log(chalk.green("✅ Your Database is running on port: ") + chalk.yellow(response.connection.port)),
          console.log(chalk.green("✅ Your Database name is: ") + chalk.magenta(response.connection.name))
      ));

      //Listen the server
      app.listen( port, () => {
        console.log("Your Server was listing on port : "+ port );
      })
    }
)();