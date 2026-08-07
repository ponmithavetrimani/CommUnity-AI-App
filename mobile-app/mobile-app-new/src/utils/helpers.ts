export const formatTime = (
  date: Date
) => {
  return date.toLocaleTimeString();
};

export const generateTrustScore =
  (
    completedTrips: number
  ) => {
    return completedTrips;
  };

export const calculateRiskLevel =
  (
    minutesStopped: number
  ) => {
    if (minutesStopped >= 10)
      return "HIGH";

    if (minutesStopped >= 5)
      return "MEDIUM";

    return "LOW";
  };