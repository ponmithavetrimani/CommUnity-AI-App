import axios from "axios";

const api = axios.create({
  baseURL: "https://community-ai-app-3.onrender.com/api",
});

export default api;