import {redisClient} from "../index";
import { Request, Response, NextFunction } from "express";

export interface RateLimitOptions {
  windowInSeconds: number;
  maxRequests: number;
  keyPrefix?: string;
}

export function rateLimiter(options: RateLimitOptions) {
  const { windowInSeconds, maxRequests, keyPrefix = "ratelimit" } = options;
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userKey = req.ip || req.headers["x-forwarded-for"] || "unknown-ip";
      const redisKey = `${keyPrefix}:${userKey}`;

      const current = await redisClient.incr(redisKey);

      if (current === 1) {
        await redisClient.expire(redisKey, windowInSeconds);
      }

      if (current > maxRequests) {
        const ttl = await redisClient.ttl(redisKey);
        res.setHeader("Retry-After", ttl);
        return res.status(429).json({
          message: "Too many requests. Please try again later.",
          retryAfterSeconds: ttl,
        });
      }
      next();
    } catch (error) {
      console.error("Rate limiter error:", error);
      next();
    }
  };
}
