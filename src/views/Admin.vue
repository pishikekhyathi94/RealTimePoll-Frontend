<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import ClassServices from "../services/ClassServices.js";
import UserServices from "../services/UserServices.js";

const router = useRouter();
const route = useRoute();
const tab = ref(1);
const user = ref(null);
const classesData = ref([]);
const usersData = ref([]);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const headers = [
  {
    align: "start",
    key: "title",
    sortable: false,
    title: "USER NAME",
  },
  { key: "email", title: "EMAIL", sortable: false },
  { key: "roles", title: "ROLES", sortable: false },
  { key: "actions", title: "" },
];

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  tab.value = route.query.tab ? parseInt(route.query.tab) : 1;
  router.replace({ query: {} });
  await fetchUsers();
});

watch(tab, async (newTab) => {
  if (user && newTab === 1) {
    await fetchUsers();
  } else if (user && newTab === 2) {
    await fetchClasses();
  }
});

function closeSnackBar() {
  snackbar.value.value = false;
}

async function fetchClasses() {
  try {
    const response = await ClassServices.getClassesForUser(user.value.id);
    classesData.value = response.data;
  } catch (error) {
    console.error("Error fetching classes:", error);
  } finally {
  }
}

async function fetchUsers() {
  try {
    const response = await UserServices.getUsers().then((res) => {
      if (res.status === 200) {
      usersData.value = response.data.map((user) => ({
        title: `${user.firstName} ${user.lastName}`,
        ...user,
      }));
      }
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
  }
}

function classDetails(cls) {
  router.push({ name: "classDetails", params: { classId: cls?.id } });
}
</script>

<template>
  <router-view />
  <v-row class="px-3 pt-4" align="center">
    <v-col cols="10">
      <v-tabs v-model="tab" align-tabs="left" color="primary" class="mb-4 px-6">
        <v-tab :value="1">Users</v-tab>
        <v-tab :value="2">Classes</v-tab>
      </v-tabs>
    </v-col>
  </v-row>
  <v-row>
    <div v-if="!user">
      <p class="text-center">Please log in to manage your classes.</p>
    </div>
    <v-col cols="11" class="mx-auto">
      <v-tabs-window v-model="tab">
        <v-tabs-window-item :key="1" :value="1">
          <v-container>
            <v-row>
              <v-col cols="12" class="pa-0">
                <v-sheet :elevation="2">
                  <v-card class="pa-4">
                    <h3 class="mb-4">Users List</h3>
                    <v-data-table
                      :headers="headers"
                      :items="usersData"
                      hide-default-footer
                      class="elevation-0"
                      item-value="title"
                      :items-per-page="usersData.length"
                      dense
                    >
                      <template #item.roles="{ item }">
                        {{
                          Array.isArray(item.roles)
                            ? item.roles.join(", ")
                            : JSON.parse(item.roles).join(", ")
                        }}
                      </template>
                    </v-data-table>
                  </v-card>
                </v-sheet>
              </v-col>
            </v-row>
          </v-container>
        </v-tabs-window-item>
        <v-tabs-window-item :key="2" :value="2">
          <div v-if="!classesData?.length" class="text-center pa-4 text-grey">
            No classes.
          </div>
          <v-container v-else>
            <v-row>
              <v-col cols="12" class="d-flex flex-wrap gap-4">
                <div
                  v-for="cls in classesData"
                  :key="cls.id"
                  class="d-flex align-center"
                >
                  <v-card
                    class="mx-4 mb-2"
                    max-width="250"
                    min-width="250"
                    hover
                  >
                    <v-img
                      height="200"
             :src="`/class.jpg`"
                      class="book-cover-image"
                      @click="classDetails(cls)"
                    ></v-img>

                    <v-card-item @click="classDetails(cls)">
                      <v-card-title class="text-h5 font-weight-bold">{{
                        cls?.name
                      }}</v-card-title>
                    </v-card-item>
                  </v-card>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-col>
  </v-row>
  <v-snackbar v-model="snackbar.value" rounded="pill">
    {{ snackbar.text }}
    <template v-slot:actions>
      <v-btn :color="snackbar.color" variant="text" @click="closeSnackBar()">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>
