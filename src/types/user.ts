
export type ISignUpData = { 
    fullName: string, 
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

export type FilterPost = {
    category: string,
    subCategory: string,
    serviceRating: number,
    distance: number,
    lat: number,
    lng: number
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