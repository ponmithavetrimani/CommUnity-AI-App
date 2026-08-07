export class TrackingTool {
  static detectUnexpectedStop(
    lastMovementTime: Date
  ) {
    const minutes =
      (Date.now() -
        lastMovementTime.getTime()) /
      60000;

    return minutes > 3;
  }

  static detectRouteDeviation(
    actualRoute: string[],
    expectedRoute: string[]
  ) {
    return !expectedRoute.every(
      (point) =>
        actualRoute.includes(point)
    );
  }

  static calculateProgress(
    completedStops: number,
    totalStops: number
  ) {
    return Math.round(
      (completedStops / totalStops) *
        100
    );
  }
}