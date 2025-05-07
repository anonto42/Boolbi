export type ISendMail = {
  name: string;
  email: string;
  otp: number;
  subjet: string
};

export type IResetPassword = {
  email: string;
  otp: number;
};
