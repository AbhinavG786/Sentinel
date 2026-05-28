import apiClient from "./client";
import type { User } from "../types/user";

export const usersApi = {
  login: (email: string, password: string) =>
    apiClient.post<{ token: string; user: User }>("/users/login", { email, password }).then((r) => r.data),

  register: (name: string, email: string, password: string) =>
    apiClient.post<{ token: string; user: User }>("/users/register", { name, email, password }).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<User>(`/users/${id}`).then((r) => r.data),

  update: (id: string, dto: Partial<User & { password: string }>) =>
    apiClient.patch<User>(`/users/${id}`, dto).then((r) => r.data),

  list: () =>
    apiClient.get<User[]>("/users").then((r) => r.data),
};
