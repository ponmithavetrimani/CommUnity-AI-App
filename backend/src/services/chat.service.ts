import Chat from "../models/Chat";

export const saveMessage = async (
senderId: string,
receiverId: string,
message: string
) => {

    return await Chat.create({
        senderId,
        receiverId,
        message,
    });

};

export const getMessages = async () => {

    return await Chat.find().sort({
        createdAt: 1,
    });

};