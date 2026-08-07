import { Request, Response } from "express";
import {
saveMessage,
getMessages,
} from "../services/chat.service";

export const sendMessage = async (
req: Request,
res: Response
) => {

    try {

        const {
            senderId,
            receiverId,
            message,
        } = req.body;

        const chat = await saveMessage(
            senderId,
            receiverId,
            message
        );

        res.status(201).json(chat);

    } catch (error) {

        res.status(500).json({
            message: "Failed to send message",
        });

    }
};

export const fetchMessages = async (
req: Request,
res: Response
) => {

    try {

        const chats = await getMessages();

        res.status(200).json(chats);

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch messages",
        });

    }
};