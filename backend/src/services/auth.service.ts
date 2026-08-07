export const sendOTPService = async (
  phone: string
) => {
  return {
    success: true,
    message: `OTP sent to ${phone}`,
  };
};

export const verifyOTPService = async (
  phone: string,
  otp: string
) => {
  return {
    success: true,
    verified: true,
    token: "demo-jwt-token",
    phone,
  };
};