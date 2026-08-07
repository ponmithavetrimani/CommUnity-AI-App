import API from "./api";

export interface JourneyData {
  source: string;
  destination: string;
  transport: string;
  startTime: string;
}

export const startJourney = async (
  journey: JourneyData
) => {
  const response = await API.post(
    "/journey/start",
    journey
  );

  return response.data;
};

export const endJourney = async (
  journeyId: string
) => {
  const response = await API.post(
    "/journey/end",
    {
      journeyId,
    }
  );

  return response.data;
};

export const getJourney = async (
  journeyId: string
) => {
  const response = await API.get(
    `/journey/${journeyId}`
  );

  return response.data;
};