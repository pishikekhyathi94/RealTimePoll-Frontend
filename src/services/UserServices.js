import apiClient from "./services";

export default {
  getUsers() {
    return apiClient.get("users");
  },
  addUser(user) {
    return apiClient.post("users/signup", user);
  },
  loginUser(user) {
    console.log(user);
    return apiClient.post("users/login", user.value, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        crossDomain: true,
        Authorization:
          "Basic " + btoa(user.value.email + ":" + user.value.password),
      },
    });
  },
  logoutUser() {
    return apiClient.post("logout");
  },
};
