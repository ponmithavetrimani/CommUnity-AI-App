import { Router } from "express";
import {
  sendOTP,
  verifyOTP,
} from "../controllers/auth.controller";

const router = Router();

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth Route Working",
  });
});

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

export default router;
