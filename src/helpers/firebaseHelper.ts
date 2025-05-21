import { initializeApp, cert  } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import  "../../service_account_key.json";
import ApiError from "../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import config from "../config";

const base64key = config.firebase_service_account_key!;
const firbaseServiceAccountKey = Buffer.from(base64key,"base64").toString("utf-8");
const servireAccountKey = JSON.parse(firbaseServiceAccountKey);

initializeApp({
  credential: cert(servireAccountKey)
});

interface message {
  notification:{
    title: string;
    body: string;
  },
  token: string
}

export const messageSend = async (msg: message) => {
  try {
    
    await getMessaging()
          .send(msg)
          .then( response => {
            console.log(response)
            return {
              message: "Successfully send the message",
              status: true
            }
          })
          .catch( err => {
            console.log(err)
          });
    
  } catch (error) {
    console.log(error)
    throw new ApiError(StatusCodes.EXPECTATION_FAILED,"Error hapending on the push message")
  }
}