import Journey from "../models/Journey";

export const getJourneys = async () => {
  return await Journey.find().sort({ date: -1 });
};