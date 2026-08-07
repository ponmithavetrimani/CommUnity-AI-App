import express from "express";
import { getTrackingDetails } from "../controllers/tracking.controller";

const router = express.Router();

router.get("/", getTrackingDetails);

export default router;