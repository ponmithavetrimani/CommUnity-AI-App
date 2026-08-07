import { Request, Response } from "express";
import { sendSMS } from "../services/twilio.service";
import EmergencyLog from "../models/emergencyLog.model";

export const triggerSOS = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, journeyId, location, contacts, buddyName } = req.body;

    const contactList: string[] = Array.isArray(contacts)
      ? contacts.filter(Boolean)
      : [];

    const mapsLink = location
      ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
      : "location unavailable";

    const message = `🚨 SOS ALERT: Emergency triggered${
      buddyName ? ` during journey with ${buddyName}` : ""
    }. Live location: ${mapsLink}`;

    await Promise.all(contactList.map((phone) => sendSMS(phone, message)));

    await EmergencyLog.create({
      userId,
      journeyId,
      type: "manual_sos",
      location,
      contactsNotified: contactList,
    });

    res.status(200).json({
      success: true,
      alertSent: true,
      userId,
      journeyId,
      location,
      contactsNotified: contactList,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("triggerSOS error:", error);
    res.status(500).json({
      success: false,
      message: "SOS failed",
    });
  }
};

export const notifyContacts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      userId,
      journeyId,
      contacts,
      buddyName,
      location,
      deviationDistance,
    } = req.body;

    const contactList: string[] = Array.isArray(contacts)
      ? contacts.filter(Boolean)
      : [];

    if (contactList.length === 0) {
      res.status(400).json({
        success: false,
        message: "No emergency contacts provided",
      });
      return;
    }

    const mapsLink = location
      ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
      : "location unavailable";

    const message = `🚨 SAFETY ALERT: Route deviation detected (${Math.round(
      deviationDistance || 0
    )}m off expected path) during journey with buddy ${
      buddyName || "Unknown"
    }. Live location: ${mapsLink}`;

    await Promise.all(contactList.map((phone) => sendSMS(phone, message)));

    await EmergencyLog.create({
      userId,
      journeyId,
      type: "deviation",
      location,
      deviationDistance,
      contactsNotified: contactList,
    });

    res.status(200).json({
      success: true,
      contactsNotified: true,
      notifiedNumbers: contactList,
    });
  } catch (error) {
    console.error("notifyContacts error:", error);
    res.status(500).json({
      success: false,
      message: "Notification failed",
    });
  }
};

export const getEmergencyLog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { journeyId } = req.params;
    const logs = await EmergencyLog.find({ journeyId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error("getEmergencyLog error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch logs",
    });
  }
};