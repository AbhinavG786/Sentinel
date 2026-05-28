import { producer, consumer } from "./kafka";
import { db } from "@shared/utils"
export const startAuditAlertConsumers = async () => {
  await consumer.subscribe({
    topic: "audit.event",
  });
  await consumer.subscribe({
    topic: "alert.created",
  });
  await consumer.subscribe({
    topic: "policy.violation",
  });
  console.log("Audit Service listening to: audit.event, alert.created, policy.violation");

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) return;
      const event = JSON.parse(message.value!.toString());
      switch (topic) {
        case "audit.event":
          await db("audit_logs").insert({
            entity_type: event.entity_type,
            entity_id: event.entity_id,
            action: event.action,
            details: event.details,
            user_id: event.user_id,
            created_at: new Date(),
          });

          console.log(
            ` Audit log created for ${event.entity_type} ${event.entity_id} action ${event.action}`
          );
          break;
        case "alert.created":
          await db("alerts").insert({
            incident_id: event.incident_id,
            triggered_by: event.triggered_by,
            message: event.message,
            severity: event.severity,
            acknowledged: false,
            created_at: new Date(),
          });

          console.log(
            ` Alert created for incident ${event.incident_id} with severity ${event.severity}`
          );
          break;
        case "policy.violation":
          for (const v of event.violations) {
            await db("policy_logs").insert({
              user_id: null,
              incident_id: null,  // not available yet at firewall stage
              policy_id: v.policy?.id || null,
              detected_violation: v.keyword,
              ai_response_snippet: null,
              action_taken: v.action,
            });
          }

          console.log(
            ` Policy violation logged for tempId ${event.tempId} (${event.violations.length} violations)`
          );
          break;
        default:
          console.log(`Unknown topic: ${topic}`);
      }
    },
  });
};
