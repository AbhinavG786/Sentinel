// test-socket.js
const { io } = require("socket.io-client");
const socket = io("ws://localhost:3000");

socket.on("connect", () => {
  console.log("Connected to Gateway!");
  socket.emit("subscribe:incidents");
  socket.emit("subscribe:alerts");
  socket.emit("subscribe:policies");
});

socket.on("incident:created", (data) => console.log("🟢 INCIDENT CREATED:", data));
socket.on("incident:analyzed", (data) => console.log("🤖 AI ANALYZED:", data));
socket.on("alert:created", (data) => console.log("🚨 ALERT:", data));
socket.on("policy:violation", (data) => console.log("🛡️ POLICY VIOLATION:", data));
