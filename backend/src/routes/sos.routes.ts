import express from "express";
import { sendSOS } from "../controllers/sos.controller";

const router = express.Router();

router.post("/", sendSOS);

export default router;