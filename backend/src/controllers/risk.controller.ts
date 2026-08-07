import { Request, Response } from "express";

export const analyzeRisk = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      stoppedMinutes,
      routeDeviation,
      missedArrival,
    } = req.body;

    let riskLevel = "LOW";

    if (stoppedMinutes > 5)
      riskLevel = "MEDIUM";

    if (
      routeDeviation ||
      missedArrival
    )
      riskLevel = "HIGH";

    res.status(200).json({
      success: true,
      riskLevel,
      recommendation:
        riskLevel === "HIGH"
          ? "Notify emergency contacts"
          : "Continue monitoring",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Risk analysis failed",
    });
  }
};

export const getRiskHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      risks: [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch risk history",
    });
  }
};