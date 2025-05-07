
export type ISignUpData = { 
    fullName: string, 
    email: string, 
    password: string, 
    confirmPassword: string, 
    phone?: string, 
    role: "USER" | "SERVICE_PROVIDER"
}