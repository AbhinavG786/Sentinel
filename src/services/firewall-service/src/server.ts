import express from "express";
import { initKafka } from "./kafka/kafka";
import analyzerRoutes from "./routes/anayzer.routes";
import ingestRoutes from "./routes/ingest.routes";


const app = express();
app.use(express.json());
app.use("/api", analyzerRoutes);
app.use("/api", ingestRoutes);


app.listen(4002, async () => {
  console.log("Knowledge Firewall service running on 4002");
  await initKafka();
});
