import { Router } from "express";
import {
  triggerSOS,
  notifyContacts,
  getEmergencyLog,
} from "../controllers/emergency.controller";

const router = Router();

router.post("/sos", triggerSOS);

router.post(
  "/notify",
  notifyContacts
);

router.get(
  "/logs/:journeyId",
  getEmergencyLog
);

export default router;