import { z } from 'zod';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const singnUpZodSchema = z.object({
  body: z.object({
    role: z.string({ required_error: "You must give your account type"}),
    fullName: z.string({ required_error: 'Full Name is required' }),
    phone: z.string().optional(),
    password: z.string({ required_error: 'Password is required' }),
    confirmPassword: z.string({ required_error: 'Confirm password is required' }),
    email: z
      .string({ required_error: 'Email is required' })
      .min(1, "Email is required.")
      .email("Please provide a valid email address.")
      .regex(emailRegex, "Email format is invalid."),
  }),
});

const signInZodSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is mandatory. Please provide a valid email address to singin."})
      .min(1, "Email is required.")
      .email("Please provide a valid email address.")
      .regex(emailRegex, "Email format is invalid."),
    password: z.string({ required_error: "Please provide your password."})
  })
});

const authEmailOTPZodSchema =  z.object({
  body: z.object({
    email: z
      .string({ required_error: "You must give your email to process next steps." })
      .min(1, "Email is required.")
      .email("Please provide a valid email address.")
      .regex(emailRegex, "Email format is invalid."),
    verificationType: z.string({ required_error: "You must give a verification type"})
  })
});

const OTPZodSchema =  z.object({
  body: z.object({
    email: z
      .string({ required_error: "You must give your email to process next steps." })
      .min(1, "Email is required.")
      .email("Please provide a valid email address.")
      .regex(emailRegex, "Email format is invalid."),
    otp: z.string({ required_error: "You must give the otp"})
  })
});

const changePasswordZodSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "You must give your email to process next steps." })
      .min(1, "Email is required.")
      .email("Please provide a valid email address.")
      .regex(emailRegex, "Email format is invalid."),
    password: z.string({ required_error: "You must give the password"}),
    confirmPassword: z.string({ required_error: "You must give the confirm password"}),
    oparationType: z.enum(["CHANGE_PASSWORD" , "FORGET_PASSWORD"], {
      required_error: "You must give your operation type to perform the operation"
    })
  })
});

const socalLoginZodSchema = z.object({
  body: z.object({
    appID: z.string({ required_error: "You must give the appID of login." }),
    provider: z.string({required_error: "You must your login provider"})
  })
});

const userUpdateProfileZodSchem = z.object({
  body: z.object({
    fullName: z.string().optional(), 
    email: z.string().optional(), 
    phone: z.string().optional(), 
    city: z.string().optional(), 
    address: z.string().optional(), 
    postalCode: z.string().optional(), 
    language: z.string().optional(), 
    category: z.string().optional(), 
    subCatagory: z.string().optional(), 
    samplePictures: z.string().optional(),
    profileImage: z.string().optional(), 
    serviceDescription: z.string().optional() 
  })
}); 

const updateUserLangouageZodSchem =  z.object({
  body: z.object({
    language: z
      .enum(["ENGLISH","SPANISH","TURKISH","GERMAN"])
  })
});

const jobPostZodSchem =  z.object({
  body: z.object({
    category: z.string({required_error: "You must give the job category"}), 
    subCatagory: z.string({required_error: "You must give the job catagory"}), 
    companyName: z.string({required_error: "You must give the company name"}), 
    deadline: z.string({required_error: "You must give the job deadline"}),
    description: z.string({required_error: "You must give the job description"}), 
    location: z.string({required_error: "You must give the job location"}), 
    title: z.string({required_error: "You must give the job title"}),
    postType: z.enum(["JOB","SERVICE"])
  })
});

const UpdatejobPostZodSchem =  z.object({
  body: z.object({
    category: z.string().optional(), 
    subCatagory: z.string().optional(), 
    companyName: z.string().optional(), 
    deadline: z.string().optional(),
    description:z.string().optional(), 
    location:z.string().optional(), 
    title:z.string().optional(),
    postType: z.enum(["JOB","SERVICE"])
  })
});

const orderValidation = z.object({
  body: z.object({
    category: z.string({ required_error: "You must give the category"}), 
    companyName: z.string({ required_error: "You must give the company name"}),
    deadline: z.string({ required_error: "You must give the deadline"}),
    jobLocation: z.string({ required_error: "You must give the job location"}),
    myBudget: z.string({ required_error: "You must give you project budget"}),
    orderDescription: z.string({ required_error: "You must give the description"}), 
    projectName: z.string({ required_error: "You must give the project name"}),
    subCatagory: z.string({ required_error: "You must give the sub category"}),
    customer: z.string({ required_error: "You must give the serviceProvider id"}),
  })
})

export const Validation = {
  singnUpZodSchema,
  signInZodSchema,
  authEmailOTPZodSchema,
  OTPZodSchema,
  changePasswordZodSchema,
  socalLoginZodSchema,
  userUpdateProfileZodSchem,
  updateUserLangouageZodSchem,
  jobPostZodSchem,
  UpdatejobPostZodSchem,
  orderValidation
};