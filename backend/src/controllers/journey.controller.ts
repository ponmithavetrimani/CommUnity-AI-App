import { Request, Response } from "express";
import { getJourneys } from "../services/tracking.service";

export const fetchJourneyHistory = async (
  req: Request,
  res: Response
) => {
  try {
    const journeys = await getJourneys();

    res.status(200).json(journeys);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch journeys",
    });
  }
};