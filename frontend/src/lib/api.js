import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

let bearer = null;
try {
  bearer = localStorage.getItem("malin.token");
} catch (e) {
  /* ignore */
}

export const setBearer = (token) => {
  bearer = token;
  try {
    if (token) localStorage.setItem("malin.token", token);
    else localStorage.removeItem("malin.token");
  } catch (e) {
    /* ignore */
  }
};

api.interceptors.request.use((config) => {
  if (bearer) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${bearer}`;
  }
  return config;
});

export const formatApiError = (err, fallback = "Une erreur est survenue.") => {
  const detail = err?.response?.data?.detail;
  if (!detail) return err?.message || fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  }
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
};
