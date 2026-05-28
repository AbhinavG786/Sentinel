// trigger-error.ts
import { Sentinel } from "../packages/sentinel-sdk/dist"; // Assuming it is built

const sentinel = new Sentinel({
  endpoint: "http://localhost:3000",
  apiKey: "XXXXX",
  source: "payment-gateway-service",
});

sentinel.captureMessage(
  "Database connection failed. user_email=john@doe.com, stripe_secret=REDACTED_TEST_KEY", 
  { severity: "critical" }
);

sentinel.flush().then(() => console.log("Payload sent to Firewall!"));
