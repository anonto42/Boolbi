import { Document, Types } from "mongoose";

export interface IOffer extends Document {
    to: Types.ObjectId;
    form: Types.ObjectId;
    projectID: Types.ObjectId;
    status: "DECLINE" | "APPROVE" | "WATING" | "PAID";
    projectName: string;
    category: string;
    budget: number;
    latLng: {
        type: string,
        coordinates: number[]
    },
    jobLocation: string;
    validFor: string,
    deadline: Date;
    startDate: Date;
    endDate: Date;
    description: string;
    companyImages: string[];
}