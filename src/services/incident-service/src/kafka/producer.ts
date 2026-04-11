import { producer } from "./kafka";
import { Incident } from "../helpers/incidents.helpers";

export const sendIncidentEvent = async (incident: Incident) => {
  try {
    await producer.send({
      topic: "incident.manual_created",
      messages: [
        {
          key: incident.id || "unknown",
          value: JSON.stringify(incident),
        },
      ],
    });
  } catch (error) {
    console.error("Error sending incident event:", error);
  }
};
