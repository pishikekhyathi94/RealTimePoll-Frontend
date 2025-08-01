<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import ClassServices from "../services/ClassServices.js";

const router = useRouter();
const route = useRoute();
const tab = ref(1);
const user = ref(null);
const classesData = ref([]);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  tab.value = route.query.tab ? parseInt(route.query.tab) : 1;
  router.replace({ query: {} });
  await fetchClasses();
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

function classDetails(cls) {
  router.push({ name: "classDetails", params: { classId: cls?.id } });
}
</script>

<template>
  <router-view />
  <div v-if="!user">
    <p class="text-center">Please log in to manage your classes.</p>
  </div>
  <div v-if="!classesData?.length" class="text-center pa-4 text-grey">
    No classes to register.
  </div>
  <v-container v-else>
    <v-row>
      <h2 class="my-4">Classes</h2>
      <v-col cols="12" class="d-flex flex-wrap gap-4">
        <div
          v-for="cls in classesData"
          :key="cls.id"
          class="d-flex align-center"
        >
          <v-card class="mx-4 mb-2" max-width="250" min-width="250" hover>
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
  <v-snackbar v-model="snackbar.value" rounded="pill">
    {{ snackbar.text }}
    <template v-slot:actions>
      <v-btn :color="snackbar.color" variant="text" @click="closeSnackBar()">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>
