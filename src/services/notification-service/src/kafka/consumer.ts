import { consumer } from "./kafka";
import { sendSlack } from "../integrations/slack";
import { sendEmail } from "../integrations/email";

export const startNotificationConsumer = async () => {
  await consumer.subscribe({ topic: "alert.created" });
  console.log("Notification worker consuming alert.created");

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const alert = JSON.parse(message.value.toString());

//       // Slack
 const text = ` *${alert.severity.toUpperCase()} ALERT*  
Incident: ${alert.incident_id}  
Message: ${alert.message}`;
      await sendSlack(
       text
      );

//       // Email
      await sendEmail({
        to: "oncall-team@company.com",
        subject: `ALERT: ${alert.severity} severity`,
        body: `
Incident ID: ${alert.incident_id}
Message: ${alert.message}
Severity: ${alert.severity}
        `,
      });

      console.log("Alert notification sent");
    }
  });
};
