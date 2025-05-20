import express, { Request, Response } from "express";
import cors from 'cors';
import cookie from 'cookie-parser';
import dotenv from "dotenv";
import router from "./routes/index.route";
import DBConnection from "./DB/ConnentDB";
import chalk from 'chalk';
import globalErrorHandler from "./middlewares/globalErrorHandler";
import { Morgan } from "./shared/morgen";
import config from "./config";
import { superUserCreate } from "./DB/SuperUserCreate";
import { StatusCodes } from "http-status-codes";

// Initializing
const app = express();
const origin = config.origin;

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

//File retrieve
app.use(express.static("uploads"));

//Api endpoints
app.use("/api/v1",router)

//live response
app.get('/', (req: Request, res: Response) => {
  const date = new Date(Date.now());
  res.send(
    `<h1 style="text-align:center; color:#173616; font-family:Verdana;">Beep-beep! The server is alive and kicking.</h1>
    <p style="text-align:center; color:#173616; font-family:Verdana;">${date}</p>
    `
  );
});

// global error
app.use(globalErrorHandler)

//handle not found route;
app.use((req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Not found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API DOESN'T EXIST",
      },
    ],
  });
});

export default app;