import { Document, Types } from "mongoose";

export interface IOrder extends Document {
    customer: Types.ObjectId;
    serviceProvider: Types.ObjectId;
    companyName: string;
    projectName: string;
    catagory: string;
    subCatagory: string;
    budget: number;
    jobLocation: string;
    deadline: string;
    description: string;
    companyImages: string[];
}