import { request } from "./client.js";

export function loginUser({ email, password }) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function signupUser({ name, email, password, role }) {
  return request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role })
  });
}
