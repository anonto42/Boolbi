import admin from "firebase-admin";
import { getMessaging } from "firebase-admin/messaging";
import ApiError from "../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import config from "../config";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const base64key = config.firebase_service_account_key!;
if (!base64key) {
  throw new ApiError(
    StatusCodes.NOT_FOUND,
    "Firebase service account key is not provided in environment variables"
  )
}

// Decode base64-encoded service account JSON
const serviceAccount = JSON.parse(
  Buffer.from(base64key, "base64").toString("utf-8")
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export default admin;

interface message {
  notification:{
    title: string;
    body: any;
    data?: any;
  },
  token: string
}

export const messageSend = async (msg: message) => {
  try {
    const response = await getMessaging().send(msg);
    console.log("Message sent successfully:", response);
    return {
      message: "Successfully sent the message",
      status: true,
    };
  } catch (error) {
    console.log(error)
    throw new ApiError(
      StatusCodes.EXPECTATION_FAILED,
      "Error hapending on the push message"
    )
  }
}