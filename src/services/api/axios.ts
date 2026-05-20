import axios, { type AxiosRequestConfig } from "axios";

function resolveBaseUrl(): string {
  return typeof window !== "undefined" ? window.location.origin : "";
}

/** Shared axios instance — use only via getRequest/postRequest in *.api.ts */
export const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

export const getRequest = async <T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await api.get<T>(url, config);
  return response.data;
};

export const postRequest = async <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await api.post<T>(url, data, config);
  return response.data;
};
