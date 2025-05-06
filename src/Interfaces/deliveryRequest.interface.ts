import { Document } from "mongoose";

export interface IDR extends Document {
    projectDoc: string,
    uploatedLink: string,
    pdfLink: string,
    photoLink: string,
    isAccepted: boolean
}