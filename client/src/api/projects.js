import { request } from "./client.js";

export function fetchProjects() {
  return request("/api/projects");
}

export function createProject(payload) {
  return request("/api/projects", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateProject(id, payload) {
  return request(`/api/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteProject(id) {
  return request(`/api/projects/${id}`, {
    method: "DELETE"
  });
}
