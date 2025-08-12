<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import ClassServices from "../services/ClassServices.js";
import UserServices from "../services/UserServices.js";
import classImage from "../images/class.jpg";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog.vue";
import AddClassDialog from "../components/AddClassDialog.vue";

const router = useRouter();
const route = useRoute();
const tab = ref(1);
const user = ref(null);
const classesData = ref([]);
const selectedUser = ref(null);
const isDeleteDialogOpen = ref(false);
const usersData = ref([]);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const newClass = ref({ name: "" });
const showAddClassDialog = ref(false);
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

async function createClass(classValues) {
  const payload = {
    name: classValues.name,
    description: classValues.noOfStudents,
    userId: user.value.id,
  };
  await ClassServices.addClass(payload)
    .then(async (response) => {
      if (response?.status === 200) {
        await fetchClasses();
        showAddClassDialog.value = false;
        snackbar.value.value = true;
        snackbar.value.color = "green";
        snackbar.value.text = `${response?.data?.name} added successfully!`;
      }
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text =
        error?.response?.data?.message ||
        "An error occurred while adding the book.";
    });
  showAddClassDialog.value = false;
}

function openDeleteDialog(user) {
  selectedUser.value = user;
  isDeleteDialogOpen.value = true;
}

function closeSnackBar() {
  snackbar.value.value = false;
}

async function fetchClasses() {
  try {
    const response = await ClassServices.getClassesForUser(user.value.id);
    classesData.value = response.data;
  } catch (error) {
    console.error("Error fetching classes:", error);
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
  router.push({
    name: "classDetails",
    params: { classId: cls?.id, className: cls?.name },
  });
}

function deleteUser(userId) {
  UserServices.deleteUser(userId)
    .then(async (response) => {
      if (response?.status === 200) {
        await fetchUsers();
        isDeleteDialogOpen.value = false;
        snackbar.value.value = true;
        snackbar.value.color = "green";
        snackbar.value.text = `user deleted successfully!`;
      }
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text =
        error?.response?.data?.message ||
        "An error occurred while updating the class.";
    });
}

function cancelDelete() {
  selectedUser.value = null;
  isDeleteDialogOpen.value = false;
}

function openAddDialog() {
  newClass.value.name = "";
  showAddClassDialog.value = true;
}
</script>

<style>
.primary-text {
  color: #990011;
}
</style>
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
                      <template #item.actions="{ item }">
                        <span
                          @click="openDeleteDialog(item)"
                          class="primary-text font-weight-medium cursor-pointer"
                          >Delete User</span
                        >
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
            <v-row justify="end">
              <v-col cols="2">
                <v-btn
                  @click="openAddDialog"
                  v-if="tab === 2"
                  class="my-2"
                  color="primary"
                >
                  Add Class
                </v-btn>
              </v-col>
            </v-row>
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
             :src="classImage"
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
  <AddClassDialog v-model="showAddClassDialog" @submit="createClass" />
  <DeleteConfirmationDialog
    v-model="isDeleteDialogOpen"
    message="Are you sure you want to delete this user?"
    @confirm="deleteUser(selectedUser.id)"
    @cancel="cancelDelete"
  />
  <v-snackbar v-model="snackbar.value" rounded="pill">
    {{ snackbar.text }}
    <template v-slot:actions>
      <v-btn :color="snackbar.color" variant="text" @click="closeSnackBar()">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>
