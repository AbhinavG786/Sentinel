import kafka from "@shared/utils/src/kafka";
import { Producer } from "kafkajs";
import { Incident } from "../helpers/incidents.helpers";

const producer: Producer = kafka.producer();

export const initProducer = async () => {
  await producer.connect();
  console.log("Kafka Producer connected");
};

export const sendIncidentEvent = async (incident: Incident) => {
  try {
    await producer.send({
      topic: "incident.created",
      messages: [
        {
          key: "incident.created",
          value: JSON.stringify(incident),
        },
      ],
    });
  } catch (error) {
    console.error("Error sending incident event:", error);
  }
};
