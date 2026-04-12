import { initKafka } from "./kafka/kafka";
import { startNotificationConsumer } from "./kafka/consumer";
import express from "express";

const app = express();
app.use(express.json());  

(async () => {
  await initKafka();
  await startNotificationConsumer();
  console.log(
    "Notification Service consuming alert.created events"
  );
})();

app.get("/health" , (req, res) => {
  res.json({ message: "Notification Service is running" });
});

app.listen(4004, () => {
  console.log("Notification Service running on port 4004");
}); 
