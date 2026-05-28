import apiClient from "./client";
import type { Stats } from "../types/stats";

export const statsApi = {
  get: () => apiClient.get<Stats>("/stats").then((r) => r.data),
};
