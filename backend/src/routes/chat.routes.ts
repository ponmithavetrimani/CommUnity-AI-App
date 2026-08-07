import express from "express";
import {
sendMessage,
fetchMessages,
} from "../controllers/chat.controller";

const router = express.Router();

router.post("/", sendMessage);

router.get("/", fetchMessages);

export default router;