import { initKafka } from "./kafka/kafka";
import { startAuditAlertConsumers } from "./kafka/consumer";
import express from "express";

const app = express();
app.use(express.json());    

(async () => {
  await initKafka();
  await startAuditAlertConsumers();
  console.log(
    "Audit Service consuming audit.event and alert.created"
  );
})();

app.get("/health" , (req, res) => {
  res.json({ message: "Audit Service is running" });
});

app.listen(4004, () => {
  console.log("Audit Service running on port 4004");
}); 
  
