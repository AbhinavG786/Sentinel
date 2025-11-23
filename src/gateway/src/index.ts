import { config } from "@shared/utils";
import app from "./app";
import { getRedisClient } from "@shared/utils";

const PORT = config.GATEWAY_PORT || 3000;

export const redisClient = getRedisClient();

app.listen(PORT, () => {
  console.log(` API Gateway running on port ${PORT}`);
});
