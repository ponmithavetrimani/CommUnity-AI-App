export const updateLocationService =
  async (
    journeyId: string,
    latitude: number,
    longitude: number
  ) => {
    return {
      journeyId,
      latitude,
      longitude,
      updatedAt: new Date(),
    };
  };

export const detectRouteDeviation =
  async (
    currentLat: number,
    currentLng: number
  ) => {
    return {
      deviated: false,
      riskLevel: "LOW",
    };
  };