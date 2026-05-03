import { request } from "./client.js";

export function fetchTeams() {
  return request("/api/teams");
}

export function createTeam(payload) {
  return request("/api/teams", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateTeam(id, payload) {
  return request(`/api/teams/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteTeam(id) {
  return request(`/api/teams/${id}`, {
    method: "DELETE"
  });
}
