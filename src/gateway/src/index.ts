import http from "http";
import { config } from "@shared/utils";
import app from "./app";
import { getRedisClient } from "@shared/utils";
import { initSocketServer } from "./websocket/socketServer";
import { startRealtimeConsumer } from "./websocket/realtimeConsumer";

const PORT = config.GATEWAY_PORT || 3000;

export const redisClient = getRedisClient();

// Create HTTP server (required for Socket.io to attach)
const server = http.createServer(app);

// Initialize Socket.io on the same server
const io = initSocketServer(server);

// Start Kafka → WebSocket bridge
startRealtimeConsumer(io).catch((err) => {
  console.error("[WebSocket] Failed to start realtime consumer:", err.message);
});

server.listen(PORT, () => {
  console.log(` API Gateway running on port ${PORT}`);
  console.log(` WebSocket server ready on ws://localhost:${PORT}`);
});
