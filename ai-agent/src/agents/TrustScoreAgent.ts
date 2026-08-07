export class TrustScoreAgent {
  static increaseScore(
    currentScore: number
  ) {
    return currentScore + 1;
  }

  static decreaseScore(
    currentScore: number
  ) {
    return Math.max(
      currentScore - 5,
      0
    );
  }

  static getBadge(score: number) {
    if (score >= 500) {
      return "Platinum";
    }

    if (score >= 200) {
      return "Gold";
    }

    if (score >= 50) {
      return "Silver";
    }

    return "Bronze";
  }
}