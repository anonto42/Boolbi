import { Document } from "mongoose";

export interface ICatagory extends Document {
    name: string;
    image: string;
    subCatagorys: string;
}