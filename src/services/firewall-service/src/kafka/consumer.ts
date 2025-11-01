import kafka from "shared-utils/src/kafka";
import axios from "axios";
import { Consumer } from "kafkajs";

const consumer: Consumer = kafka.consumer({ groupId: "firewall-analyzer" });

export const initConsumer = async () => {
  await consumer.connect();
  console.log("Kafka Consumer connected");
  await consumer.subscribe({ topic: "incident-events", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (message.key?.toString() !== "incident.created" || !message.value) {
        return;
      }
      const incident = JSON.parse(message.value.toString());
      console.log("Received incident event:", incident.title);
      try {
        const analysis = await axios.post("http://localhost:4002/analyze", {
          incident,
        });
        // console.log("AI Analysis Completed:", analysis.data.summary);
      } catch (err: any) {
        console.error("AI Analysis Error:", err.message);
      }
    },
  });
};
