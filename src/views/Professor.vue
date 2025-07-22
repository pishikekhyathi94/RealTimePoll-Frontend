<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import AddClassDialog from "../components/AddClassDialog.vue";
import ClassServices from "../services/ClassServices.js";

const router = useRouter();
const tab = ref(1);
const loading = ref(false);
const user = ref(null);
const classesData = ref([]);
const showAddClassDialog = ref(false);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const newClass = ref({ name: "" });

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  if (user) {
    await fetchClasses();
  }
});

function closeSnackBar() {
  snackbar.value.value = false;
}

async function fetchClasses() {
  loading.value = true;
  try {
    const response = await ClassServices.getClasses(user?.value?.id);
    classesData.value = response.data;
  } catch (error) {
    console.error("Error fetching classes:", error);
  } finally {
    loading.value = false;
  }
}

async function createClass(classValues) {
  const payload = {
    ...classValues,
    userId: user?.value?.id,
  };
  console.log("Creating class with payload::", payload);
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

function openAddDialog() {
  newClass.value.name = "";
  showAddClassDialog.value = true;
}

function classDetails(classId) {
  router.push({ name: "classDetails", params: { classId } });
}

</script>

<style>
.header-btn .v-btn__content {
  font-weight: 600;
}
</style>

<template>
  <router-view />
  <v-row class="px-3 pt-4" align="center" >
    <v-col cols="10">
      <v-tabs v-model="tab" align-tabs="left" color="primary" class="mb-4 px-6">
        <v-tab :value="1">Classes</v-tab>
      </v-tabs>
    </v-col>
    <v-col cols="2">
      <v-btn
        @click="openAddDialog"
        v-if="tab === 1"
        class="my-2"
        prepend-icon="mdi-plus-box"
        color="primary"
      >
        Add Class
      </v-btn>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="11" class="mx-auto">
      <div v-if="!user">
        <p class="text-center">Please log in to manage your classes.</p>
      </div>
      <div v-else class="d-flex flex-wrap ">
            <div v-if="!classesData?.length" class="text-center pa-4 text-grey">
              You haven't created any classes yet.
            </div>
            <div v-for="(cls, index) in classesData" :key="cls.id" class="d-flex align-center">
              <v-card
      class="mx-2 mb-2"
      max-width="250"
      @click="
        classDetails(cls?.id)
      "
      hover
    >
      <v-img
        height="200"
        :src="`/class.jpg`"
        class="book-cover-image"
      ></v-img>

      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold">{{
          cls?.name
        }}</v-card-title>
        <v-card-subtitle>
          <!-- <span class="me-1 font-weight-medium">{{
            book?.bookGenre?.bookGenre || book?.bookGenre
          }}</span> -->
        </v-card-subtitle>
      </v-card-item>
    </v-card>
            </div>
      </div>
    </v-col>
  </v-row>
  <AddClassDialog v-model="showAddClassDialog" @submit="createClass" />
  <v-snackbar v-model="snackbar.value" rounded="pill">
    {{ snackbar.text }}
    <template v-slot:actions>
      <v-btn :color="snackbar.color" variant="text" @click="closeSnackBar()">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>
