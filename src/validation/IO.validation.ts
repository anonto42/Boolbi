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


export const Validation = {
  singnUpZodSchema,
  signInZodSchema,
  authEmailOTPZodSchema,
  OTPZodSchema,
  changePasswordZodSchema,
  socalLoginZodSchema
};