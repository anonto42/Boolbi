import { Document, Types } from "mongoose";

export interface IPost extends Document {
  title: string;
  coverImage: string;
  postType: string;
  catagory: string;
  subCatagory: string;
  companyName: string;
  location: string;
  latLng: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };

  deadline: string;
  jobDescription: string;
  showcaseImages: string[];
  creatorID: Types.ObjectId;
  ratings?: {
    stars: number;
    feedback?: string;
    from: Types.ObjectId;
  }[];
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