import express from "express";
import { initConsumer } from "./kafka/consumer";

const app = express();
app.use(express.json());

app.post("/analyze", async (req, res) => {
  const { incident } = req.body;

  // Later we'll add OpenAI API logic here
  const fakeSummary = `This is an AI analysis summary for: ${incident.title}`;
  res.json({ summary: fakeSummary });
});

app.listen(4002, async () => {
  console.log("Knowledge Firewall service running on 4002");
  await initConsumer();
});
