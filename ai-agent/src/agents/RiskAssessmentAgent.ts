export class RiskAssessmentAgent {
  static assessRisk(data: {
    stopDuration: number;
    routeDeviation: boolean;
    sosTriggered: boolean;
  }) {
    if (data.sosTriggered) {
      return {
        level: "CRITICAL",
        score: 100,
      };
    }

    if (data.routeDeviation) {
      return {
        level: "HIGH",
        score: 80,
      };
    }

    if (data.stopDuration > 3) {
      return {
        level: "MEDIUM",
        score: 50,
      };
    }

    return {
      level: "LOW",
      score: 10,
    };
  }
}