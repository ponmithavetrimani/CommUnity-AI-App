import SOS from "../models/SOS";

export const createSOS = async (data: any) => {
  return await SOS.create(data);
};