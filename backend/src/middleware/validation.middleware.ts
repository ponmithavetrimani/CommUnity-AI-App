import { Request, Response, NextFunction } from "express";

export const validateJourney = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    source,
    destination,
    transportMode,
  } = req.body;

  if (
    !source ||
    !destination ||
    !transportMode
  ) {
    return res.status(400).json({
      success: false,
      message:
        "source, destination and transportMode are required",
    });
  }

  next();
};