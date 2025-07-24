import apiClient from "./services";

class ClassServices {
  getClasses(userId) {
    return apiClient.get(`/classes/user/${userId}`);
  }

  addClass(data) {
    return apiClient.post("/classes", data);
  }
    addQuiz(data) {
    return apiClient.post("quiz", data);
  }

  getQuizzes(classId){
    return apiClient.get("quiz/all/"+classId);
  }
  
  getQuizDetails(quizId) {
    return apiClient.get(`quiz/${quizId}`);
  }

   updateClass(id, data) {
    return apiClient.put(`/classes/${id}`, data);
  }

   deleteClass(id) {
    return apiClient.delete(`/classes/${id}`);
  }
}

export default new ClassServices();
