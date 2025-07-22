import apiClient from "./services";

class ClassServices {
  getClasses(userId) {
    return apiClient.get(`/classes/user/${userId}`);
  }

  addClass(data) {
    return apiClient.post("/classes", data);
  }
}

export default new ClassServices();
