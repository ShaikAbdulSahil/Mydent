import axiosClient from './axios-client';

export const signup = async (data: {
  email: string;
  firstName: string;
  password: string;
  mobile: string;
  address: string;
}) => {
  const response = await axiosClient.post('/auth/signup/user', data);
  return response;
};

export const login = async (data: { email: string; password: string }) => {
  const response = await axiosClient.post('/auth/login/user', data);
  return response;
};

// ─── Email Verification (Signup) ─────────────────────────

export const sendVerificationEmail = async (email: string) => {
  const response = await axiosClient.post('/auth/send-verification-email', { email });
  return response;
};

export const verifyEmail = async (email: string, otp: string) => {
  const response = await axiosClient.post('/auth/verify-email', { email, otp });
  return response;
};

// ─── Forgot Password (OTP-based) ────────────────────────

export const forgotPassword = async (email: string) => {
  const response = await axiosClient.post('/auth/forgot-password', { email });
  return response;
};

export const verifyResetOTP = async (email: string, otp: string) => {
  const response = await axiosClient.post('/auth/verify-reset-otp', { email, otp });
  return response;
};

export const resetPassword = async (
  email: string,
  resetToken: string,
  newPassword: string,
) => {
  const response = await axiosClient.post('/auth/reset-password', {
    email,
    resetToken,
    newPassword,
  });
  return response;
};

// ─── Login OTP ──────────────────────────────────────────

export const sendOTP = async (email: string) => {
  const response = await axiosClient.post('/auth/send-otp', { email });
  return response;
};

export const verifyOTP = async (email: string, otp: string) => {
  const response = await axiosClient.post('/auth/verify-otp', { email, otp });
  return response;
};

export const resendOTP = async (email: string) => {
  const response = await axiosClient.post('/auth/resend-otp', { email });
  return response;
};