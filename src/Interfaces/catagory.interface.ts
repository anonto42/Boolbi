import { Document, Types } from "mongoose";

export interface ICatagory extends Document {
    name: string;
    image: string;
    subCatagroys: Types.ObjectId[]
}