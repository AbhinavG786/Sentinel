export const SERVICES = {
  incidents: process.env.INCIDENT_SERVICE_URL || "http://localhost:4001",
  users: process.env.USER_SERVICE_URL || "http://localhost:4000",
  firewall: process.env.FIREWALL_SERVICE_URL || "http://localhost:4002",
  ai: process.env.AI_SERVICE_URL || "http://localhost:4004",
};