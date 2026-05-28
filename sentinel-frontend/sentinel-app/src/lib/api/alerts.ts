import apiClient from "./client";
import type { AlertListResponse, Alert } from "../types/alert";

export interface AlertFilters {
  severity?: string;
  acknowledged?: boolean;
  page?: number;
  limit?: number;
}

export const alertsApi = {
  list: (filters: AlertFilters = {}) =>
    apiClient.get<AlertListResponse>("/alerts", { params: filters }).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Alert>(`/alerts/${id}`).then((r) => r.data),

  acknowledge: (id: string) =>
    apiClient.patch<Alert>(`/alerts/${id}/ack`).then((r) => r.data),
};
