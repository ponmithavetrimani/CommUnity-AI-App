import { Router } from "express";
import {
  analyzeRisk,
  getRiskHistory,
} from "../controllers/risk.controller";

const router = Router();

router.post("/analyze", analyzeRisk);

router.get(
  "/history/:journeyId",
  getRiskHistory
);

export default router;