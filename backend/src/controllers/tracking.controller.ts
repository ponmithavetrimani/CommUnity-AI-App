import { Request, Response } from "express";

export const getTrackingDetails = async (
  req: Request,
  res: Response
) => {
  res.json({
    source: "T Nagar",
    destination: "Tambaram",
    transport: "Bus",
    busNumber: "21B",
    status: "Journey Started",
  });
};