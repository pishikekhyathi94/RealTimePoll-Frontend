<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import UserServices from "../services/UserServices";

const router = useRouter();

const user = ref(null);
const title = ref("LIVE POLL");
const userRole = ref(null);

onMounted(() => {
  user.value = JSON.parse(localStorage.getItem("user"));
  userRole.value = localStorage.getItem("userRole");
});

function logout() {
  UserServices.logoutUser()
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.log(error);
    });
  localStorage.removeItem("user");
  user.value = null;
  router.push({ name: "login" });
}

function switchProfile(selectedRole) {
  if (selectedRole === "student") {
    userRole.value = "student";
    window.localStorage.setItem("userRole", "student");
    router.push({ name: "student" });
  } else if (selectedRole === "professor") {
    userRole.value = "professor";
    window.localStorage.setItem("userRole", "professor");
    router.push({ name: "professor" });
  } else if (selectedRole === "admin") {
    userRole.value = "admin";
    window.localStorage.setItem("userRole", "admin");
    router.push({ name: "admin" });
  }
}
</script>

<template>
  <div>
    <v-app-bar color="primary" app dark>
      <div class="d-flex align-center">
        <router-link :to="{ name: 'recipes' }">
          <v-img
            class="mx-2"
            src="/Live_Poll.jpg"
            height="50"
            width="50"
            contain
          ></v-img>
        </router-link>

        <v-toolbar-title class="title">
          {{ title }}
        </v-toolbar-title>
      </div>

      <v-spacer></v-spacer>

      <v-menu v-if="user !== null" min-width="200px" rounded>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar
              class="mx-auto text-center"
              color="secondary"
              size="large"
            >
              <span class="white--text font-weight-bold">{{
                `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
              }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-card-text>
            <div class="mx-auto text-center">
              <h3>{{ `${user.firstName} ${user.lastName}` }}</h3>
              <p class="text-caption mt-1">
                {{ user.email }}
              </p>
              <v-divider class="my-3" v-if="user.roles.length > 1"></v-divider>
              <div class="d-flex flex-column gap-4">
                <v-btn
                  v-if="
                    user.roles.length > 1 &&
                    (userRole === 'professor' || userRole === 'admin')
                  "
                  variant="flat"
                  color="primary"
                  class="mb-2"
                  @click="switchProfile('student')"
                >
                  Switch to student
                </v-btn>
                <v-btn
                  v-if="
                    user.roles.length > 1 &&
                    (userRole === 'student' || userRole === 'admin')
                  "
                  variant="flat"
                  color="primary"
                  class="mb-2"
                  @click="switchProfile('professor')"
                >
                  Switch to professor
                </v-btn>
                <v-btn
                  v-if="
                    user.roles.length > 1 &&
                    (userRole === 'student' || userRole === 'professor')
                  "
                  variant="flat"
                  color="primary"
                  @click="switchProfile('admin')"
                >
                  Switch to Admin
                </v-btn>
              </div>
              <v-divider class="my-3"></v-divider>
              <v-btn rounded variant="text" @click="logout()"> Logout </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-app-bar>
  </div>
</template>
