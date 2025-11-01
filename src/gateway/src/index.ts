import { config } from "shared-utils/src/env";
import app from "./app";

const PORT = config.GATEWAY_PORT || 4000;

app.listen(PORT, () => {
  console.log(` API Gateway running on port ${PORT}`);
});
