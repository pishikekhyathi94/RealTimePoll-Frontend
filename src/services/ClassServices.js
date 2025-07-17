import api from "./api.js";

class ClassServices {
  // GET all classes for a specific user
  getClasses(userId) {
    //backend route will be updated to /classes/user/:userId
    return api.get(`/classes/user/${userId}`);
  }

  // POST a new class
  addClass(data) {
    return api.post("/classes", data);
  }

  // DELETE a class )
  // deleteClass(id) {
  //   return api.delete(`/classes/${id}`);
  // }
}

export default new ClassServices();
