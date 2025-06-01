import { JwtPayload } from "jsonwebtoken"

export type ISignUpData = { 
    fullName: string, 
    address: string,
    email: string, 
    password: string, 
    confirmPassword: string, 
    phone?: string, 
    role: "USER" | "SERVICE_PROVIDER",
    lat: string,
    lng: string
}

export type SignInData = {
    email: string,
    password: string,
    deviceID: string
}

export type JobPost = {
    title: string;
    category: string;
    companyName: string;
    location: string;
    deadline: Date;
    description: string;
    postType: "JOB" | "SERVICE";
    subCatagory: string;
    lng: number, 
    lat: number
}

export interface FilterPost {
  category?: string;
  subCategory?: string;
  lat: number;
  lng: number;
  distance?: number;
  page?: number;
  limit?: number;
}

export type TOffer = {
    to: string;
    companyName: string;
    projectName: string;
    category: string;
    myBudget: number;
    location: string;
    deadline: Date;
    description: string;
    postID: string;
}

export type TRating = {
    star: number,
    feedback: string,
    orderID: string
}

export interface GetRecommendedPostsOptions {
  payload: JwtPayload;
  page?: number;
  limit?: number;
}

export interface NotificationQuery {
  page?: number;
  limit?: number;
}

export interface SearchData {
  searchQuery: string;
  page?: number;
  limit?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}