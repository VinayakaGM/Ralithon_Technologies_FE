export interface AuthResponse {
  status_code: number;
  message: string;
  token: string;
  email: string;
  userType: string;
  userId: number;
  userStatus: string;
  otpVerify: boolean;
}

export interface LoginData {
  emailId: string;
  password: string;
}

export interface RegisterData {
  emailId: string;
  firstName: string;
  lastName: string;
  password: string;
  contact: string;
  checkPassword: string;
}

export interface VerifyOTPParams {
  userId: number;
  otp: string;
}

export interface AuthResponse {
  statusCode: number;
  message: string;
}
export type GenerateOtp = string;

export interface User {
  userId: number;
  email: string;
  userType: string;
  userStatus: string;
}
