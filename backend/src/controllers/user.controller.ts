import { Request, Response } from "express";
import User from "../models/User";

// Register
export const registerUser = async (
  req: Request,
  res: Response
) => {
  try {
    const user = new User(req.body);

    await user.save();

    res.status(201).json({
      message: "User created successfully",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

// Login
export const loginUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, password } = req.body;

    const user = await User.findOne({
      name,
      password,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Profile
export const getProfile = async (
  req: Request,
  res: Response
) => {
  try {
    const user = await User.findOne({
      name: req.params.name,
    });

    res.json(user);
  } catch (error) {
    res.status(500).json(error);
  }
};