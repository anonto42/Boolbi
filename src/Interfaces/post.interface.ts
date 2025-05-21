import { Document, Types } from "mongoose"

export interface IPost extends Document {
    title: string;
    coverImage: string; 
    postType: string;
    catagory: string;
    companyName: string;
    location: string;
    latLng: {
        lat: number
        lng: number
    },
    deadline: string; 
    jobDescription: string;
    showcaseImages: string[];
    creatorID: Types.ObjectId;
    subCatagory: string;
    ratings: Reating[]
}

export type Reating = {
    stars: number;
    feedback: string;
    from: Types.ObjectId;
}

export interface IPhotos{
    fildName: string;
    images: File[];
}