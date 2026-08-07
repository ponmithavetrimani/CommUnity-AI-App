import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const sendOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phone } = req.body;

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      phone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

export const verifyOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phone, otp } = req.body;

    if (otp !== "123456") {
      res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
      return;
    }

    const token = jwt.sign(
      { phone },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      verified: true,
      phone,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};