import { Router } from "express";

import {
  registerUser,
  loginUser,
  getProfile,
} from "../controllers/user.controller";

const router = Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/:name", getProfile);

export default router;