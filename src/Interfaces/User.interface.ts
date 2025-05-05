import { Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email?: string;
    role?: "user" | "admin";
    createdAt: Date;
    updatedAt: Date;
}