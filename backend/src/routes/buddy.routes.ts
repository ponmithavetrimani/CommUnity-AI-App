import { Router } from "express";
import {
  findBuddy,
  acceptBuddy,
  getBuddySession,
} from "../controllers/buddy.controller";

const router = Router();

router.post("/find", findBuddy);

router.post("/accept", acceptBuddy);

router.get(
  "/session/:sessionId",
  getBuddySession
);

export default router;