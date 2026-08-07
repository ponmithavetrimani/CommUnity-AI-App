import express from "express";
import { fetchJourneyHistory } from "../controllers/journey.controller";

const router = express.Router();

router.get("/", fetchJourneyHistory);

export default router;