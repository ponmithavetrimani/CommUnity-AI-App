import Buddy from "../models/Buddy";

export const getBuddies = async () => {
  return [
    {
      name: "Priya",
      trustScore: 95
    }
  ];
};

export const acceptBuddyRequest = async () => {
  return {
    message: "Buddy request accepted"
  };
};

export const getSession = async () => {
  return {
    sessionId: "12345",
    status: "active"
  };
};