import kafka from "@shared/utils/src/kafka";
import { Consumer } from "kafkajs";
import { Producer } from "kafkajs";

export const producer: Producer = kafka.producer();

export const consumer: Consumer = kafka.consumer({ groupId: "firewall-analyzer" });

export const initKafka= async () => {
  await producer.connect();
  console.log("Kafka Producer connected");
  await consumer.connect();
  console.log("Kafka Consumer connected");
}