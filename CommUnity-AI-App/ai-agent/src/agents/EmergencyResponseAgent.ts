export class EmergencyResponseAgent {
  static generateResponse(
    userId: string,
    location: any
  ) {
    return {
      alert: true,
      notifyBuddy: true,
      notifyContacts: true,
      lastKnownLocation: location,
      userId,
      timestamp: new Date(),
    };
  }
}