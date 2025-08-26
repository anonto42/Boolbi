import { Document, Types } from "mongoose";

export interface IOffer extends Document {
    to: Types.ObjectId;
    form: Types.ObjectId;
    projectID: Types.ObjectId;
    status: "DECLINE" | "APPROVE" | "WATING";
    projectName: string;
    category: string;
    budget: number;
    jobLocation: string;
    deadline: Date;
    startDate: Date;
    endDate: Date;
    description: string;
    companyImages: string[];
}