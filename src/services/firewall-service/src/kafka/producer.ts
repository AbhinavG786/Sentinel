import {sanitizeLogs} from "shared-utils/src/sanitizeLogs";
import {db} from "shared-utils/src/db/knex"
import {v4 as uuidv4} from "uuid";
import {IncidentCreatedEvent} from "shared-utils/src/types"
import {producer} from "./kafka"

export const produceCreateIncidentEvent = async (log:any) => {
     const event: IncidentCreatedEvent = {
    tempId: uuidv4(),
    traceId: log.traceId || uuidv4(),
    source: log.source || "unknown",
    severity: log.severity || "medium",
    sanitizedSnippet: await sanitizeLogs(db, log.message),
    sanitizedPayloadRef: log.payloadRef,
    timestamp: new Date().toISOString(),
  };

  await producer.send({
    topic:"incident.created",
    messages:[{
        key:"event.tempId",
        value: JSON.stringify(event),
    }]
  })

  console.log(`Incident created with tempId: ${event.tempId} for log id: ${log.id}`);

  await producer.disconnect();
}