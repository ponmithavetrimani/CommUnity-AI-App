import API from "./api";

export const sendOTP = async (phone: string) => {
  const response = await API.post("/auth/send-otp", {
    phone,
  });

  return response.data;
};

export const verifyOTP = async (
  phone: string,
  otp: string
) => {
  const response = await API.post("/auth/verify-otp", {
    phone,
    otp,
  });

  return response.data;
};