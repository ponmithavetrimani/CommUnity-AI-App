export const calculateTrustScore =
  async (
    currentScore: number,
    completedTrips: number
  ) => {
    return (
      currentScore + completedTrips
    );
  };

export const updateTrustScore =
  async (
    userId: string,
    increment: number
  ) => {
    return {
      userId,
      increment,
      updated: true,
    };
  };

export const getTrustLevel =
  (
    score: number
  ): string => {
    if (score >= 500)
      return "Platinum";

    if (score >= 250)
      return "Gold";

    if (score >= 100)
      return "Silver";

    return "Bronze";
  };