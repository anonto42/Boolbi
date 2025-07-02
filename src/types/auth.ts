import { USER_ROLES } from "../enums/user.enums";

export type IVerifyEmail = {
  email: string;
  oneTimeCode: number;
};

export type ILoginData = {
  email: string;
  password: string;
};

export type IChangePassword = {
  password: string;
  confirmPassword: string;
  email: string;
  token: string
};

export type ISocalLogin = {
  uid: string;
  provider: string;
  email: string;
  displayName: string;
  deviceID: string
}