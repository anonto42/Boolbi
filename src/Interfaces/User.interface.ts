import { Document, Types } from "mongoose";
import { Verification_For } from "../enums/user.enums";

export interface IUser extends Document {
    job: Types.ObjectId[];
    orders: Types.ObjectId[];
    favouriteServices: Types.ObjectId[];
    iOffered: Types.ObjectId[];
    myOffer: Types.ObjectId[];
    deviceID: string;
    description: string;
    fullName: string;
    email: string;
    role: string;
    password: string;
    phone: string;
    category: string;
    subCatagory: string;
    searchedCatagory: string[];
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
        hash: string,
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
    };
    ratings?: {
        stars: number;
        feedback?: string;
        from: Types.ObjectId;
    }[];
    latLng: {
        type: "Point";
        coordinates: [number, number]; // [lng, lat]
    };
}