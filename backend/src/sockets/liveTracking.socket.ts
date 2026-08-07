import { Server } from "socket.io";

export const initializeTrackingSocket =
  (io: Server) => {
    io.on("connection", (socket) => {
      console.log(
        `🟢 Connected: ${socket.id}`
      );

      socket.on(
        "joinJourney",
        (journeyId: string) => {
          socket.join(journeyId);
        }
      );

      socket.on(
        "locationUpdate",
        (data) => {
          io.to(data.journeyId).emit(
            "locationUpdated",
            data
          );
        }
      );

      socket.on(
        "sosAlert",
        (data) => {
          io.to(data.journeyId).emit(
            "emergencyTriggered",
            data
          );
        }
      );

      socket.on(
        "disconnect",
        () => {
          console.log(
            `🔴 Disconnected: ${socket.id}`
          );
        }
      );
    });
  };