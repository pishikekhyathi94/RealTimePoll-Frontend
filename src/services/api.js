import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/Realtimepoll",
  headers: {
    "Content-type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      const user = JSON.parse(userJson);
      if (user && user.token) {
        config.headers["Authorization"] = "Bearer " + user.token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
