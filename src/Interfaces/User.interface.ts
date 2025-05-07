import { Document, Types } from "mongoose";

export enum Verification_For { 
    FORMAT_PASSWORD = "FORMAT_PASSWORD", 
    CHANGE_PASSWORD = "CHANGE_PASSWORD"
}

export interface IUser extends Document {
    fullName: string;
    email: string;
    role: string;
    password: string;
    phone: string;
    category: Types.ObjectId;
    subCatagory: Types.ObjectId;
    job: Types.ObjectId[];
    createdOrder: Types.ObjectId[];
    favouriteServices: Types.ObjectId[];
    searchedCatagory: Types.ObjectId[];
    offers: Types.ObjectId[];
    city: string;
    postalCode: string;
    address: string;
    profileImage: string;
    samplePictures: string[];
    accountVerificationsPictures: string[];
    accountActivityStatus: string;
    accountStatus: string;
    language: string;
    isVerified: boolean;
    accountBalance: number;
    privacyPolicy: string;
    termsConditions: string;
    otpVerification: {
        otp: number,
        time: Date,
        verificationType: Verification_For
    }
}