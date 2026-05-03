import { request } from "./client.js";

export function fetchDashboard() {
  return request("/api/dashboard");
}
