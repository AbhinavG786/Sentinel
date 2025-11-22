import { config } from "@shared/utils";
import app from "./app";

const PORT = config.GATEWAY_PORT || 3000;

app.listen(PORT, () => {
  console.log(` API Gateway running on port ${PORT}`);
});
