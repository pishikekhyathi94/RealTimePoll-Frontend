<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import ClassServices from "../services/ClassServices";

const quizzes = ref([]);
const route = useRoute();
const router = useRouter();
const user = ref(null);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const classId = route.params.classId;
const quizId = route.params.quizId;

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  if (user) {
    fetchQuizDetails();
  }
});
const formatDate = (date) => new Date(date).toLocaleString();
async function fetchQuizDetails() {
  try {
    const response = await ClassServices.getQuizDetails(quizId);
    if (response.status === 200) {
      // Process the quiz details as needed
      console.log("Quiz Details:", response.data);
      quizzes.value = response.data;
    } else {
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = "Failed to fetch quiz details.";
    }
  } catch (error) {
    console.error("Error fetching quiz details:", error);
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = "Failed to fetch quiz details.";
  }
}

function closeSnackBar() {
  snackbar.value.value = false;
}

function goBack() {
  router.push({ name: "classDetails", params: { classId } });
}
</script>

<template>
  <v-container>
    <v-row justify="space-between" align="center" class="my-4 mx-1">
      <v-btn @click="goBack" variant="text" prepend-icon="mdi-check-circle">
        <template v-slot:prepend>
          <v-icon size="x-large">mdi-arrow-left</v-icon>
        </template>
        <h2>Class - {{ classId }} {{ quizzes?.name }}</h2>
      </v-btn>
    </v-row>
    <v-card class="pa-4 mb-4">
      <v-card-title class="text-h5">{{ quizzes?.name }}</v-card-title>
      <v-card-subtitle>{{ quizzes?.description }}</v-card-subtitle>
    </v-card>

    <v-card
      v-for="question in quizzes?.question"
      :key="question?.id"
      class="mb-4"
    >
      <v-card-title>
        {{ question?.name }}
        <v-chip class="ml-auto" color="blue" text-color="white">
          ⏱ {{ question?.timer }} sec
        </v-chip>
      </v-card-title>

      <v-card-text>
        <v-list dense>
          <v-list-item
            v-for="option in question?.option"
            :key="option.id"
            :class="option.correctOption ? 'bg-green-lighten-4' : ''"
          >
            <v-list-item-content>{{ option.name }}</v-list-item-content>
            <v-list-item-icon v-if="option.correctOption"> </v-list-item-icon>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
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
