
export type ISignUpData = { 
    fullName: string, 
    email: string, 
    password: string, 
    confirmPassword: string, 
    phone?: string, 
    role: "USER" | "SERVICE_PROVIDER"
}

export type SignInData = {
    email: string,
    password: string
}

export type JobPost = {
    title: string;
    catagory: string;
    companyName: string;
    location: string;
    deadline: Date;
    description: string;
    postType: "JOB" | "SERVICE"
}