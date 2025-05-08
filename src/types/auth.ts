export type IVerifyEmail = {
  email: string;
  oneTimeCode: number;
};

export type ILoginData = {
  email: string;
  password: string;
};

export type IChangePassword = {
  currentPassword: string;
  password: string;
  confirmPassword: string;
  email: string;
  oparationType: "CHANGE_PASSWORD" | "FORGET_PASSWORD",
};

export type ISocalLogin = {
  appID: string;
  provider: string
}