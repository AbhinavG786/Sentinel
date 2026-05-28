export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "viewer";
  created_at: string;
  updated_at: string;
}
