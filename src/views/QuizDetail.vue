<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import ClassServices from "../services/ClassServices";
import EditQuestionDialog from "../components/EditQuestionDialog.vue";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog.vue";

const quizzes = ref([]);
const route = useRoute();
const router = useRouter();
const user = ref(null);
const userRole = ref(null);
const isEditDialogOpen = ref(false);
const selectedQuestion = ref(null);
const isDeleteDialogOpen = ref(false);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const classId = route.params.classId;
const quizId = route.params.quizId;

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  userRole.value = localStorage.getItem("userRole");
  if (user) {
    fetchQuizDetails();
  }
});
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

function openEditDialog(question) {
  selectedQuestion.value = question;
  isEditDialogOpen.value = true;
}

async function handleQuestionUpdate(updatedQuestion) {
  const payload = {
    id: updatedQuestion?.id,
    name: updatedQuestion?.name,
    options: updatedQuestion?.option,
    quizId: updatedQuestion?.quizId,
    timer: updatedQuestion?.timer,
  };
  await ClassServices.updateQuestion(payload)
    .then(async (response) => {
      if (response?.status === 200) {
        isEditDialogOpen.value = false;
        selectedQuestion.value = null;
        snackbar.value.value = true;
        snackbar.value.color = "green";
        snackbar.value.text = "Question updated successfully.";
        await fetchQuizDetails();
      } else {
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = "Failed to update question.";
      }
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text =
        error?.response?.data?.message ||
        "An error occurred while updating the question.";
    });
}

function openDeleteDialog(question) {
  selectedQuestion.value = question;
  isDeleteDialogOpen.value = true;
}

function cancelDelete() {
  isDeleteDialogOpen.value = false;
  selectedQuestion.value = null;
}

async function deleteQuestion(questionId) {
  try {
    await ClassServices.deleteQuestion(questionId).then(async (response) => {
      if (response?.status === 200) {
        isDeleteDialogOpen.value = false;
        selectedQuestion.value = null;
        snackbar.value.value = true;
        snackbar.value.color = "green";
        snackbar.value.text = "Question deleted successfully.";
        fetchQuizDetails();
      } else {
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = "Failed to delete question.";
      }
    });
  } catch (error) {
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text =
      error?.response?.data?.message ||
      "An error occurred while deleting the question.";
  }
}
</script>

<template>
  <v-container>
    <v-row justify="space-between" align="center" class="my-4 mx-1">
      <v-btn @click="goBack" variant="text" prepend-icon="mdi-check-circle">
        <template v-slot:prepend>
          <v-icon size="x-large">mdi-arrow-left</v-icon>
        </template>
        <h2>Title: {{ quizzes?.name }}</h2>
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
      <v-card-actions>
        <v-btn
          color="primary"
          variant="text"
          append-icon="mdi-pencil-box-outline"
          size="medium"
          @click="openEditDialog(question)"
        >
          <span class="mr-2">Update Question </span></v-btn
        >
        <v-spacer />
        <v-btn
          color="error"
          append-icon="mdi-delete"
          variant="text"
          @click="openDeleteDialog(question)"
        >
          Delete Question</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-container>
  <EditQuestionDialog
    v-model="isEditDialogOpen"
    :isEdit="true"
    :question="selectedQuestion"
    @updateQuestion="handleQuestionUpdate"
  />
  <DeleteConfirmationDialog
    v-model="isDeleteDialogOpen"
    message="Are you sure you want to delete this question?"
    @confirm="deleteQuestion(selectedQuestion.id)"
    @cancel="cancelDelete"
  />
  <v-snackbar v-model="snackbar.value" rounded="pill" close-delay="3000">
    {{ snackbar.text }}
    <template v-slot:actions>
      <v-btn :color="snackbar.color" variant="text" @click="closeSnackBar()">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>
