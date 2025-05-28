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
  deviceID: string;
  provider: string;
  accountType: USER_ROLES.USER | USER_ROLES.SERVICE_PROVIDER
}