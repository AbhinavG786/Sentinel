export const SEVERITY_OPTIONS = ["critical", "high", "medium", "low"] as const;
export const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"] as const;
export const DEFAULT_PAGE_SIZE = 10;
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
