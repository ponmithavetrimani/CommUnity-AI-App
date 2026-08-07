export class BuddyMatchingAgent {
  static findBuddy(
    userJourney: any,
    availableUsers: any[]
  ) {
    return availableUsers.find(
      (user) =>
        user.source === userJourney.source &&
        user.destination ===
          userJourney.destination
    );
  }
}