export class SafetyAgent {
  static evaluateSafety(data: {
    isMoving: boolean;
    routeDeviation: boolean;
    delayedMinutes: number;
  }) {
    let riskLevel = "LOW";

    if (data.routeDeviation) {
      riskLevel = "HIGH";
    } else if (
      !data.isMoving &&
      data.delayedMinutes > 3
    ) {
      riskLevel = "MEDIUM";
    }

    return {
      riskLevel,
      timestamp: new Date(),
    };
  }
}