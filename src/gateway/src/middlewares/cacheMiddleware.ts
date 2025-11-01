import { Request, Response, NextFunction } from "express";
import redisClient from "shared-utils/src/redisClient";

export function cacheMiddleware(ttlSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") return next();
    const key = `cache:${req.originalUrl}`;
    try {
      const cachedRaw = await redisClient.get?.(key);
      if (cachedRaw) {
        try {
          const cached = JSON.parse(cachedRaw) as { status: number; body: any };
          res.setHeader("X-Cache", "HIT");
          console.log("Serving from cache");
          res.status(cached.status).json(cached.body);
          return;
        } catch (parseError) {
          console.error("Failed to parse cached data:", parseError);
        }
      }
      res.setHeader("X-Cache", "MISS");
      const originalJson = res.json.bind(res);
      //   res.json = (data: any) => {
      //     // persist to cache asynchronously; return the Response synchronously
      //     redisClient
      //       .setex(key, ttlSeconds, JSON.stringify(data))
      //       .catch((err) => {
      //         console.error("Failed to set cache:", err);
      //       });
      res.json = (data: any) => {
        // capture status at the moment of sending
        const payload = JSON.stringify({
          status: res.statusCode || 200,
          body: data,
        });

        // set in redis (tolerant to client API)
        const setPromise = (redisClient as any).setEx
          ? (redisClient as any).setEx(key, ttlSeconds, payload)
          : (redisClient as any).setex
            ? (redisClient as any).setex(key, ttlSeconds, payload)
            : Promise.reject(new Error("redis client has no setEx/setex"));

        setPromise.catch((err: any) => {
          console.error("Failed to set cache:", err);
        });
        return originalJson(data);
      };
      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next();
    }
  };
}
