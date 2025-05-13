import { Document } from "mongoose";


export interface IAnnuncement extends Document {
    title: string;
    descriptions: string;
    status: string;
}