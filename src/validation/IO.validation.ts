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
    password: z.string({ required_error: "Please provide your password."}),
    deviceID: z.string({ required_error: "You must give the deviceID for login"})
  })
});

const authEmailOTPZodSchema =  z.object({
  body: z.object({
    email: z
      .string({ required_error: "You must give your email to process next steps." })
      .min(1, "Email is required.")
      .email("Please provide a valid email address.")
      .regex(emailRegex, "Email format is invalid.")
  })
});

const OTPZodSchema =  z.object({
  body: z.object({
    email: z
      .string({ required_error: "You must give your email to process next steps." })
      .min(1, "Email is required.")
      .email("Please provide a valid email address.")
      .regex(emailRegex, "Email format is invalid."),
    otp: z.number({ required_error: "You must give the otp"})
  })
});

const socalLoginZodSchema = z.object({
  body: z.object({
    uid: z.string({ required_error: "You must give the uid of login." }),
    provider: z.string({required_error: "You must your login provider"}),
    email: z.string({required_error: "You must your email"}),
    displayName: z.string({required_error: "You must your login provider"}),
    deviceID: z.string({required_error:"You must give the device id!"})
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
    description: z.string().optional() 
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
    companyName: z.string({required_error: "You must give the company name"}), 
    deadline: z.string({required_error: "You must give the job deadline"}),
    description: z.string({required_error: "You must give the job description"}), 
    location: z.string({required_error: "You must give the job location"}), 
    title: z.string({required_error: "You must give the job title"}),
    lng: z.string({required_error:"You must give the lng number for the location Matrix"}), 
    lat: z.string({required_error:"You must give the lat number for the location Matrix"})
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

const offerCreateValidation = z.object({
  body: z.object({
    to: z.string().optional(),
    companyName: z.string().optional(),
    projectName: z.string().optional(),
    category: z.string().optional(), 
    myBudget: z.string().optional(),
    location: z.string().optional(),
    deadline: z.string().optional(),
    description: z.string().optional()
  })
})

const offerValidation = z.object({
  body: z.object({
    acction: z.enum(["DECLINE", "APPROVE"]),
    offerId: z.string({required_error:"You must give the id of created offer to prosed next stape"})
  })
})

const offerDeletaionValidationZod = z.object({
  query: z.object({
    offerID: z.string({ required_error: "you must give the offer "})
  })
})

const searchValidationZod = z.object({
  query: z.object({
    string: z.string({ required_error: "you must give a name or other thing to search"})
  })
})

const filterData = z.object({
  body: z.object({
    category: z.string({ required_error: "you must give the category to filer"}),
    subCategory: z.string({ required_error: "you must give the category to filer"}),
    serviceRating: z.number().optional(),
    distance: z.number({ required_error: "You must give the distance like 5km or 6km"}),
    lat: z.number({ required_error: "you must give the lat to filer"}),
    lng: z.number({ required_error: "you must give the lng to filer"}),
  })
})

const forgetPassword = z.object({
  body: z.object({
    email: z.string({required_error: "You must give the email"}), 
    password: z.string({required_error: "You must give the password!"}), 
    confirmPassword: z.string({required_error: "You must give the confirm password"}), 
    token: z.string({required_error: "You must give the token for change the password!"})
  })
})

const ratingZodSchema = z.object({
  body: z.object({
    star: z.number({required_error: "You must give the number that you want to give!"}), 
    feedback: z.string({required_error: "You must give the feedback"}), 
    providerID: z.string({required_error: "You must give the id of the provider that you want to give rating!"})
  })
})


export const Validation = {
  singnUpZodSchema,
  ratingZodSchema,
  filterData,
  signInZodSchema,
  authEmailOTPZodSchema,
  OTPZodSchema,
  socalLoginZodSchema,
  userUpdateProfileZodSchem,
  updateUserLangouageZodSchem,
  jobPostZodSchem,
  UpdatejobPostZodSchem,
  offerCreateValidation,
  offerValidation,
  offerDeletaionValidationZod,
  searchValidationZod,
  forgetPassword
};