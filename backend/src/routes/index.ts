import { Router } from "express";

import authRoutes from "./auth.routes";
import journeyRoutes from "./journey.routes";
import buddyRoutes from "./buddy.routes";
import riskRoutes from "./risk.routes";
import emergencyRoutes from "./emergency.routes";
import chatRoutes from "./chat.routes";
import trackingRoutes from "./tracking.routes";
import sosRoutes from "./sos.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/journey", journeyRoutes);
router.use("/buddy", buddyRoutes);
router.use("/risk", riskRoutes);
router.use("/emergency", emergencyRoutes);
router.use("/chat", chatRoutes);
router.use("/tracking", trackingRoutes);
router.use("/sos", sosRoutes);

export default router;