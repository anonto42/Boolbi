import { Document, Types } from "mongoose";

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
}