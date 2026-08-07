import { Schema, model, Document } from "mongoose";

export interface IEmergencyLog extends Document {
  userId?: string;
  journeyId: string;
  type: "deviation" | "manual_sos";
  location?: {
    latitude: number;
    longitude: number;
  };
  deviationDistance?: number;
  contactsNotified: string[];
  createdAt: Date;
}

const emergencyLogSchema = new Schema<IEmergencyLog>({
  userId: { type: String },
  journeyId: { type: String, required: true },
  type: { type: String, enum: ["deviation", "manual_sos"], required: true },
  location: {
    latitude: Number,
    longitude: Number,
  },
  deviationDistance: Number,
  contactsNotified: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

export default model<IEmergencyLog>("EmergencyLog", emergencyLogSchema);