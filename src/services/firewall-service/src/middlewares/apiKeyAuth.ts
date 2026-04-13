import { Request, Response, NextFunction } from "express";
import { db, getRedisClient } from "@shared/utils";

const redis = getRedisClient();

/**
 * DB-backed API key validation for the ingest endpoint.
 * Validates the X-API-Key header against the Postgres 'projects' table,
 * caching results in Redis to handle high throughput.
 */
export const validateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["x-api-key"] as string;

  if (!apiKey) {
    return res.status(401).json({ error: "Missing X-API-Key header" });
  }

  try {
    // 1. Check Redis Cache
    const cachedProjectId = await redis.get(`apikey:${apiKey}`);
    
    if (cachedProjectId) {
      if (cachedProjectId === "invalid") {
        return res.status(403).json({ error: "Invalid API key" });
      }
      (req as any).projectId = cachedProjectId; // Embed project ID for pipeline
      return next();
    }

    // 2. Check Database
    const project = await db("projects").where({ api_key: apiKey }).first();

    if (!project) {
      // Cache invalid checks for 5 minutes to prevent DDoS
      await redis.setex(`apikey:${apiKey}`, 300, "invalid");
      return res.status(403).json({ error: "Invalid API key" });
    }

    // 3. Cache valid keys for 1 hour
    await redis.setex(`apikey:${apiKey}`, 3600, project.id);
    
    (req as any).projectId = project.id;
    next();
  } catch (error) {
    console.error("API Key validation error:", error);
    res.status(500).json({ error: "Internal validation error" });
  }
};
