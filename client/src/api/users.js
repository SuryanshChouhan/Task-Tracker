import { request } from "./client.js";

export function fetchUsers() {
  return request("/api/users");
}

export function updateUserRole(id, role) {
  return request(`/api/users/${id}/role`, {
    method: "PUT",
    body: JSON.stringify({ role })
  });
}

export function updateUserTeam(id, teamId) {
  return request(`/api/users/${id}/team`, {
    method: "PUT",
    body: JSON.stringify({ teamId })
  });
}
