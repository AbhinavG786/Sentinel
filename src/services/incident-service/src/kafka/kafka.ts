import {kafka} from "@shared/utils";
import { Consumer } from "kafkajs";
import { Producer } from "kafkajs";

export const producer: Producer = kafka.producer();

export const consumer1: Consumer = kafka.consumer({ groupId: "incident-create-consumer" });
export const consumer2: Consumer = kafka.consumer({ groupId: "incident-analyze-consumer" });

export const initKafka= async () => {
  await producer.connect();
  console.log("Kafka Producer connected");
  await consumer1.connect();
  console.log("Kafka Consumer 1 connected");
  await consumer2.connect();
  console.log("Kafka Consumer 2 connected");
}