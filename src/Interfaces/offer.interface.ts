import { Document, Types } from "mongoose";

export interface IOffer extends Document {
    to: Types.ObjectId;
    form: Types.ObjectId;
    postID: Types.ObjectId;
    status: "DECLINE" | "APPROVE" | "WATING";
    companyName: string;
    projectName: string;
    category: string;
    budget: number;
    jobLocation: string;
    deadline: string;
    description: string;
    companyImages: string[];
}