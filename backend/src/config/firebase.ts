import {
  initializeApp,
  cert,
  getApps,
} from "firebase-admin/app";

import {
  getMessaging,
} from "firebase-admin/messaging";

import path from "path";
import { readFileSync } from "fs";

const serviceAccountPath = path.join(
  __dirname,
  "../../firebase-service-account.json"
);

const serviceAccount = JSON.parse(
  readFileSync(serviceAccountPath, "utf8")
);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export const sendPushNotification =
  async (
    token: string,
    title: string,
    body: string
  ) => {
    try {
      await getMessaging().send({
        token,
        notification: {
          title,
          body,
        },
      });

      console.log(
        "Push Notification Sent"
      );
    } catch (error) {
      console.error(
        "Notification Error:",
        error
      );
    }
  };