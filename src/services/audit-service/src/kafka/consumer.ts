import {producer,consumer} from "./kafka"
import { db } from "shared-utils/src/db/knex";

export const startAuditConsumer = async () => {
    await consumer.subscribe({
        topic: "audit.event",
    })
    console.log("Audit service now listening for audit events");

    await consumer.run({
        eachMessage: async ({message}) => {
            if ( message.key?.toString() !== "audit.event" || !message.value) return;
            const auditEvent = JSON.parse(message.value!.toString());

            await db("audit_logs").insert({
                entity_type: auditEvent.entity_type,
                entity_id: auditEvent.entity_id,
                action: auditEvent.action,
                details: auditEvent.details,
                user_id: auditEvent.user_id,
                created_at: new Date(),
            });

            console.log(` Audit log created for ${auditEvent.entity_type} ${auditEvent.entity_id} action ${auditEvent.action}`);
        }
    })
}