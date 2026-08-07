import {
  sendPushNotification,
} from "../../../backend/src/config/firebase";

export class NotificationTool {
  static async sendRiskAlert(
    token: string,
    level: string
  ) {
    await sendPushNotification(
      token,
      "Safety Alert",
      `Risk Level: ${level}`
    );
  }

  static async sendSOSAlert(
    token: string
  ) {
    await sendPushNotification(
      token,
      "SOS Activated",
      "Emergency assistance requested."
    );
  }

  static async sendBuddyMatch(
    token: string,
    buddyName: string
  ) {
    await sendPushNotification(
      token,
      "Travel Buddy Found",
      `${buddyName} matched with your journey`
    );
  }
}