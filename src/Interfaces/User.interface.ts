import { Document, Types } from "mongoose";
import { string } from "zod";

export enum Verification_For { 
    FORMAT_PASSWORD = "FORMAT_PASSWORD", 
    CHANGE_PASSWORD = "CHANGE_PASSWORD",
    NULL = ""
}

export interface IUser extends Document {
    fullName: string;
    email: string;
    role: string;
    password: string;
    phone: string;
    category: string;
    subCatagory: string;
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
    serviceDescription: string;
    otpVerification: {
        isVerified: {
            status: boolean,
            time: Date
        },
        otp: number,
        time: Date,
        verificationType: Verification_For
    };
    isSocialAccount:{
        isSocal: boolean;
        provider: string;
        socialIdentity: string;
    };
}