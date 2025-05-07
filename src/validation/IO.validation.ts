import { z } from 'zod';

const singnUpZodSchema = z.object({
  body: z.object({
    role: z.string({ required_error: "You must give your account type"}),
    fullName: z.string({ required_error: 'Full Name is required' }),
    phone: z.string().optional(),
    password: z.string({ required_error: 'Password is required' }),
    confirmPassword: z.string({ required_error: 'Confirm password is required' }),
    email: z.string({ required_error: 'Email is required' }),
  }),
});

const signInZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is mandatory. Please provide a valid email address to singin."}),
    password: z.string({ required_error: "Please provide your password."})
  })
})


export const Validation = {
  singnUpZodSchema,
  signInZodSchema
};