import {sanitizeLogs} from "@shared/utils";
import {db} from "@shared/utils";
import {v4 as uuidv4} from "uuid";
import {IncidentCreatedEvent} from "@shared/utils"
import {producer} from "./kafka"

export const produceCreateIncidentEvent = async (log:any) => {
  const traceId = log.traceId || uuidv4();
  const tempId = uuidv4();
  const { sanitizedData, triggeredPolicies } = await sanitizeLogs(db, log, undefined, traceId);
     const event: IncidentCreatedEvent = {
    tempId,
    traceId,
    source: log.source || "unknown",
    severity: log.severity || "medium",
    sanitizedSnippet: sanitizedData,
    sanitizedPayloadRef: log.payloadRef,
    timestamp: new Date().toISOString(),
  };

  await producer.send({
    topic:"incident.created",
    messages:[{
        key:event.tempId,
        value: JSON.stringify(event),
    }]
  })

  console.log(`Incident created with tempId: ${event.tempId} for log id: ${log.id}`);

  if (triggeredPolicies.length > 0) {
  await producer.send({
    topic: "policy.violation",
    messages: [{
      key: event.tempId,
      value: JSON.stringify({
        tempId: event.tempId,
        traceId: event.traceId,
        violations: triggeredPolicies,
        timestamp: new Date().toISOString(),
      }),
    }],
  });
}

  // await producer.disconnect();
}