import Redis from "ioredis";

// const redisClient=new Redis({
//     host:process.env.REDIS_HOST||'127.0.0.1',
//     port:Number(process.env.REDIS_PORT)||6379,
//     password:process.env.REDIS_PASSWORD||undefined,
// })

let redisClient:Redis |null=null;

function getRedisClient(){
  if (!redisClient) {
    if (!process.env.REDIS_URL) {
      throw new Error("REDIS_URL is missing");
    }
    redisClient = new Redis(process.env.REDIS_URL);
  }
  
  redisClient.on("connect", () => {
    console.log("Connected to Redis server");
    });
    
    redisClient.on("error", (err) => {
      console.error("Redis error:", err);
    });
    return redisClient;
}

export { getRedisClient };