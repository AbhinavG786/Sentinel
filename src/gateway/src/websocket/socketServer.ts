import { Server as SocketServer } from "socket.io";
import http from "http";

let io: SocketServer;

export const initSocketServer = (httpServer: http.Server): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[WebSocket] Dashboard client connected: ${socket.id}`);

    // Allow clients to join specific rooms for filtered updates
    socket.on("subscribe:incidents", () => {
      socket.join("incidents");
      console.log(`[WebSocket] ${socket.id} subscribed to incidents`);
    });

    socket.on("subscribe:alerts", () => {
      socket.join("alerts");
      console.log(`[WebSocket] ${socket.id} subscribed to alerts`);
    });

    socket.on("subscribe:policies", () => {
      socket.join("policies");
      console.log(`[WebSocket] ${socket.id} subscribed to policies`);
    });

    socket.on("disconnect", () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketServer => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initSocketServer first.");
  }
  return io;
};
