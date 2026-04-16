// trigger-error.ts
import { Sentinel } from "../packages/sentinel-sdk/dist"; // Assuming it is built

const sentinel = new Sentinel({
  endpoint: "http://localhost:3000",
  apiKey: "sk_live_93ef2f381793a8cad1861d604fc1e592d9272df04f88bbf2",
  source: "payment-gateway-service",
});

sentinel.captureMessage(
  "Database connection failed while processing transaction. user_email=john@doe.com, stripe_secret=sk_live_1234567890", 
  { severity: "critical" }
);

sentinel.flush().then(() => console.log("Payload sent to Firewall!"));
