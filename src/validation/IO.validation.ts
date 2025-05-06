import { z } from 'zod';

const singnUpZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
    oneTimeCode: z.number({ required_error: 'One time code is required' }),
  }),
});


export const AuthValidation = {
  singnUpZodSchema
};