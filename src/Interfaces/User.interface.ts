import { Document, Types } from "mongoose";
import { Verification_For } from "../enums/user.enums";

export interface IUser extends Document {
    job: Types.ObjectId[];
    orders: Types.ObjectId[];
    favouriteServices: Types.ObjectId[];
    iOffered: Types.ObjectId[];
    myOffer: Types.ObjectId[];
    fullName: string;
    email: string;
    role: string;
    password: string;
    phone: string;
    category: string;
    subCatagory: string;
    searchedCatagory: string;
    city: string;
    postalCode: string;
    address: string;
    profileImage: string;
    samplePictures: string[];
    accountActivityStatus: string;
    accountStatus: string;
    accountBalance: number;
    privacyPolicy: string;
    termsConditions: string;
    serviceDescription: string;
    language: string;
    isVerified: {
        trdLicense: "",
        sampleImages: string[],
        status: boolean
    };
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
    paymentCartDetails:{
        customerID: string;
        cardID: string;
    }
}