import admin from "firebase-admin";
import serviceAccount from "../../service_account_key.json";
import ApiError from "../errors/ApiError";
import { StatusCodes } from "http-status-codes";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any)
});

interface message {
  notification:{
    title: string;
    body: string;
  },
  token: string
}

export const messageSend = async (props: message) => {
  try {
    const response = await admin.messaging().send(props)
    console.log(response)
  } catch (error) {
    console.log(error)
    throw new ApiError(StatusCodes.EXPECTATION_FAILED,"Error hapending on the push message")
  }
}