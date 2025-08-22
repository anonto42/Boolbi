import { Document, Types } from "mongoose";

export interface IUser extends Document {
    job: Types.ObjectId[];
    orders: Types.ObjectId[];
    favouriteServices: Types.ObjectId[];
    iOffered: Types.ObjectId[];
    myOffer: Types.ObjectId[];
    deviceID: string;
    userVerification: boolean;
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
        doc: string,
        images: string[],
        status: boolean
    };
    otpVerification: {
        otp: number,
        time: Date,
        key: string
    };
    isSocialAccount:{
        isSocal: boolean;
        socialIdentity: string;
    };
    paymentCartDetails:{
        customerID: string;
        cardID: string;
    };
    ratings: {
        stars: number;
        feedback: string;
        from: Types.ObjectId;
    }[];
    latLng: {
        type: "Point";
        coordinates: [number, number]; // [lng, lat]
    };
}