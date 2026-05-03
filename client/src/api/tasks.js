import { request } from "./client.js";

export function fetchTasks(projectId) {
  const suffix = projectId ? `?projectId=${projectId}` : "";
  return request(`/api/tasks${suffix}`);
}

export function createTask(payload) {
  return request("/api/tasks", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateTask(id, payload) {
  return request(`/api/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteTask(id) {
  return request(`/api/tasks/${id}`, {
    method: "DELETE"
  });
}
