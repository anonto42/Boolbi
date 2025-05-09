import { Document, Types } from "mongoose"

export interface IPost extends Document {
    title: string;
    postType: string;
    catagory: string;
    companyName: string;
    location: string;
    deadline: string; 
    jobDescription: string;
    showcaseImages: string[];
    creatorID: Types.ObjectId;
}

export interface IPhotos{
    fildName: string;
    images: File[];
}