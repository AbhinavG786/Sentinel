import { Kafka } from "kafkajs";

const kafka= new Kafka({
    clientId:"sentinel",
     brokers: [process.env.KAFKA_BROKER || "kafka:9092"],
})

export { kafka };
