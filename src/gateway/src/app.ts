import express from "express";
import cors from "cors";
import incidentsRouter from "./routes/incidents.routes";
import usersRouter from "./routes/users.routes";
import firewallRouter from "./routes/firewall.routes";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.send("API Gateway Server is healthy");
});

app.use("/incidents", incidentsRouter);
app.use("/users", usersRouter);
app.use("/firewall", firewallRouter);

export default app;
