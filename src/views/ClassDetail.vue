<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AddQuizDialog from "../components/AddQuizDialog.vue";
import ClassServices from "../services/ClassServices";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog.vue";

const route = useRoute();
const router = useRouter();
const user = ref(null);
const userRole = ref(null);
const isDeleteDialogOpen = ref(false);
const selectedQuiz = ref(null);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const quizzes = ref([]);
const classId = route.params.classId;

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  userRole.value = localStorage.getItem("userRole");
  if (user) {
    await fetchQuizzes();
  }
});


const showAddQuiz = ref(false);

function openAddQuizDialog() {
  showAddQuiz.value = true;
}

async function fetchQuizzes() {
  try {
    const response = await ClassServices.getQuizzes(classId);
    quizzes.value = response.data;
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = "Failed to fetch quizzes.";
  }
}

async function handleAddQuiz(newQuiz) {
  try {
    await ClassServices.addQuiz({
      prompt: newQuiz.name,
      title: newQuiz.title,
      description: newQuiz.description,
      userId: user.value.id,
      classId: classId,
    }).then(async (res) => {
      if (res?.status === 200) {
        await fetchQuizzes();
        snackbar.value.value = true;
        snackbar.value.color = "green";
        snackbar.value.text = `quiz added successfully!`;
      }
    });
  } catch (error) {
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = "Failed to add quiz.";
  }
  showAddQuiz.value = false;
}

function closeSnackBar() {
  snackbar.value.value = false;
}

function goBack() {
    router.push({ name: "professor" });
  }

function openDeleteDialog(quiz) {
  selectedQuiz.value = quiz;
  isDeleteDialogOpen.value = true;
}

function cancelDelete() {
  isDeleteDialogOpen.value = false;
  selectedQuiz.value = null;
}
async function deleteQuiz(quizId) {
  await ClassServices.deleteQuiz(quizId)
    .then(async (response) => {
      if (response.status === 200) {
        snackbar.value.value = true;
        snackbar.value.color = "green";
        snackbar.value.text = "Quiz deleted successfully!";
        await fetchQuizzes();
      }
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = "Failed to delete quiz.";
    });
}

</script>

<style scoped>
.hoverable {
  cursor: pointer;
  transition: background 0.2s ease;
}
.hoverable:hover {
  background-color: #f5f5f5;
}
</style>

<template>
  <v-container>
    <v-row justify="space-between" align="center" class="my-4 mx-1">
      <v-btn @click="goBack" variant="text" prepend-icon="mdi-check-circle">
        <template v-slot:prepend>
          <v-icon size="x-large">mdi-arrow-left</v-icon>
        </template>
        <h2>Class - {{ classId }} Quizzes</h2>
      </v-btn>
      <v-btn color="primary" @click="openAddQuizDialog">Add Quiz</v-btn>
    </v-row>

    <v-list two-line v-if="quizzes.length > 0">
      <v-list-item v-for="quiz in quizzes" :key="quiz.id">
        <v-list-item-content>
          <div role="button" @click="goToQuiz(quiz.id)">
            <v-list-item-title>{{ quiz.name }}</v-list-item-title>
            <v-list-item-subtitle class="mb-3">{{
              quiz.description
            }}</v-list-item-subtitle>
          </div>
          <v-list-item-action class="mr-auto text-right justify-end">
            <v-btn
              @click="openDeleteDialog(quiz)"
              class="my-2"
              prepend-icon="mdi-trash-can"
              color="primary"
              v-if="userRole === 'professor'"
              variant="flat"
            >
              Delete Quiz
            </v-btn>
          </v-list-item-action>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <div v-else class="text-center pa-4 text-grey">
      No quizzes available for this class.
    </div>

    <AddQuizDialog
      v-model="showAddQuiz"
      @submit="handleAddQuiz"
      :fetch-quizzes="fetchQuizzes"
    />
     <DeleteConfirmationDialog
    v-model="isDeleteDialogOpen"
    message="Are you sure you want to delete this Quiz?"
    @confirm="deleteQuiz(selectedQuiz.id)"
    @cancel="cancelDelete"
  />
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
