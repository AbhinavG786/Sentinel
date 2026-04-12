import { Request, Response, NextFunction } from "express";

/**
 * Simple API key middleware for the ingest endpoint.
 * Validates the X-API-Key header against a comma-separated list in ALLOWED_API_KEYS env var.
 * If ALLOWED_API_KEYS is not set, all requests are allowed (dev mode).
 */
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const allowedKeys = process.env.ALLOWED_API_KEYS;

  // If no keys configured, allow all (dev mode)
  if (!allowedKeys) {
    return next();
  }

  const apiKey = req.headers["x-api-key"] as string;

  if (!apiKey) {
    return res.status(401).json({ error: "Missing X-API-Key header" });
  }

  const keys = allowedKeys.split(",").map((k) => k.trim());

  if (!keys.includes(apiKey)) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  next();
};
