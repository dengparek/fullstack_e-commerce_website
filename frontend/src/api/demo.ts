import axios from "axios";

const base_url = import.meta.env.BASE_URL;

if (base_url) {
  console.log("Base URL does NOT exist");
}
export const apiClient = axios.create({
  baseURL: base_url,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use();
