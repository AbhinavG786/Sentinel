import { Server as SocketServer } from "socket.io";
import { kafka } from "@shared/utils";

const consumer = kafka.consumer({ groupId: "gateway-realtime" });

export const startRealtimeConsumer = async (io: SocketServer) => {
  await consumer.connect();

  await consumer.subscribe({ topic: "incident.created" });
  await consumer.subscribe({ topic: "incident.analyzed" });
  await consumer.subscribe({ topic: "alert.created" });
  await consumer.subscribe({ topic: "policy.violation" });

  console.log("[WebSocket] Kafka consumer connected — streaming real-time events");

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) return;

      const event = JSON.parse(message.value.toString());

      switch (topic) {
        case "incident.created":
          io.to("incidents").emit("incident:created", {
            tempId: event.tempId,
            traceId: event.traceId,
            source: event.source,
            severity: event.severity,
            timestamp: event.timestamp,
          });
          console.log(`[WebSocket] Emitted incident:created [trace: ${event.traceId}]`);
          break;

        case "incident.analyzed":
          io.to("incidents").emit("incident:analyzed", {
            incidentId: event.incidentId,
            traceId: event.traceId,
            summary: event.summary,
            root_cause: event.root_cause,
            resolution: event.resolution,
            confidence: event.confidence,
            analyzedAt: event.analyzedAt,
          });
          console.log(`[WebSocket] Emitted incident:analyzed [${event.incidentId}]`);
          break;

        case "alert.created":
          io.to("alerts").emit("alert:created", {
            incident_id: event.incident_id,
            traceId: event.traceId,
            severity: event.severity,
            message: event.message,
          });
          console.log(`[WebSocket] Emitted alert:created [${event.incident_id}]`);
          break;

        case "policy.violation":
          io.to("policies").emit("policy:violation", {
            tempId: event.tempId,
            traceId: event.traceId,
            violations: event.violations.map((v: any) => ({
              keyword: v.keyword,
              action: v.action,
              policyName: v.policy?.name || "Unknown",
            })),
            timestamp: event.timestamp,
          });
          console.log(`[WebSocket] Emitted policy:violation [${event.violations?.length} violations]`);
          break;

        default:
          break;
      }
    },
  });
};
