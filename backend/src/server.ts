import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import userRoutes from "./routes/user.routes";
import routes from "./routes";
import { connectMongoDB } from "./config/mongodb";
import { initializeTrackingSocket } from "./sockets/liveTracking.socket";

dotenv.config();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Initialize Socket.IO
initializeTrackingSocket(io);

// Connect MongoDB
connectMongoDB();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use("/api/users", userRoutes);
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CommUnity AI Backend Running 🚀",
  });
});

app.use("/api", routes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
