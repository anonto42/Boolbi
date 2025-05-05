import { Document } from "mongoose";
import { ACCOUNT_STATUS, ACCOUNT_VERIFICATION_STATUS, SELECTED_LANGUAGE } from "../enums/user.enums";

export interface IUser extends Document {
    fullName: string;
    email: string;
    role: string;
    password: string;
    category: string;
    subCatagory: string;
    city: string;
    postalCode: string;
    address: string;
    samplePictures: string[];
    accountVerificationsPictures: string[];
    accountActivityStatus: ACCOUNT_STATUS;
    language: SELECTED_LANGUAGE;
    profile_verification: ACCOUNT_VERIFICATION_STATUS;
    createdAt: Date;
    updatedAt: Date;
}