import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginUser, signupUser } from "../api/auth.js";

const AuthContext = createContext(null);
const storageKey = "ttm_auth";

function getStoredAuth() {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getStoredAuth());

  useEffect(() => {
    if (auth) {
      localStorage.setItem(storageKey, JSON.stringify(auth));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [auth]);

  const login = async (email, password) => {
    const data = await loginUser({ email, password });
    setAuth(data);
    return data;
  };

  const signup = async (payload) => {
    const data = await signupUser(payload);
    setAuth(data);
    return data;
  };

  const logout = () => {
    setAuth(null);
  };

  const value = useMemo(() => ({ auth, login, signup, logout }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
