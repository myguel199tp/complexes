export interface VerifyOtpRequest {
  userId: string;
  otp: string;
  deviceId?: string;
}
