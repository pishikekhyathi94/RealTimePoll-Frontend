<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AddQuizDialog from "../components/AddQuizDialog.vue";
import ClassServices from "../services/ClassServices";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog.vue";
import InstructionsDialog from "../components/InstructionsDialog.vue";
import CreateQuestionsDialog from "../components/CreateQuestionsDialog.vue";
import { downloadExcel } from "../reports/QuizReportDownloadStudent";
import { format, parseISO } from "date-fns";
import { usePoll } from "../reports/usePoll";

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
const className = route.params.className;
const showQuizInstructions = ref(false);
const showCreateQuiz = ref(false);
const manualEditQuiz = ref(null);
const loading = ref(false);
const { participateQuiz } = usePoll();

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
    const response = await ClassServices.getQuizzes(classId, user.value.id);
    quizzes.value = response.data;
  } catch (error) {
    console.error("Error fetching quiz:", error);
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = "Failed to fetch quiz.";
  }
}

async function handleAddQuiz(newQuiz) {
  loading.value = true;
  try {
    await ClassServices.addQuiz({
      prompt: newQuiz.name,
      userId: user.value.id,
      classId: classId,
    }).then(async (res) => {
      if (res?.status === 200) {
        showAddQuiz.value = false;
        showCreateQuiz.value = true;
        manualEditQuiz.value = res.data;
        loading.value = false;
      }
    });
  } catch (error) {
    loading.value = false;
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
  if (userRole.value === "student") {
    router.push({ name: "student", query: { tab: 2 } });
  } else if (userRole.value === "professor") {
    router.push({ name: "professor" });
  } else if (userRole.value === "admin") {
    router.push({ name: "admin" });
  }
}

function openQuizInstructions(quiz) {
  showQuizInstructions.value = true;
  selectedQuiz.value = quiz;
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

function goToQuiz(quizId, className, isQuizCompleted = false) {
  if (
    userRole.value === "professor" ||
    userRole.value === "admin" ||
    (userRole.value === "student" && isQuizCompleted)
  ) {
    router.push(`/professor/class/${classId}/${className}/quiz/${quizId}`);
  }
}

async function updatequicLock(quizId, quizType) {
  await ClassServices.updateQuizLock({
    quizId: quizId?.id,
    quizType: quizType,
  })
    .then(async (response) => {
      if (response.status === 200) {
        snackbar.value.value = true;
        snackbar.value.color = "green";
        snackbar.value.text = "Quiz status updated successfully!";
        await fetchQuizzes();
      }
    })
    .catch((error) => {
      console.error("Error deleting quiz:", error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = "Failed to update quiz status.";
    });
}

async function beginQuiz() {
  await ClassServices.takeQuiz({
    userId: user.value.id,
    quizId: selectedQuiz.value.id,
  })
    .then(async (res) => {
      if (res?.status === 200) {
        showQuizInstructions.value = false;
        window.localStorage.setItem(
          "quizStart",
          JSON.stringify(selectedQuiz.value)
        );
        window.localStorage.setItem(
          "quizStartQuestion",
          JSON.stringify(res.data)
        );
        participateQuiz(selectedQuiz.value.id);
        router.push({
          name: "startQuiz",
          params: { quizId: selectedQuiz.value.id },
        });
      }
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error?.response?.data?.message || "Failed to start quiz.";
    });
}

function viewQuizReports(quiz) {
  router.push({
    name: "quizReports",
    params: { quizId: quiz.id },
  });
}

async function downloadQuizReports(quizId, quizName) {
  await ClassServices.getQuizReports(quizId)
    .then((response) => {
      if (response.status === 200 && response?.data?.reports?.length > 0) {
        downloadExcel(response?.data?.reports, quizName);
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function getDateFormat(date) {
  if (!date) return "";
  const parsedDate = parseISO(date);
  const prettyDate = format(parsedDate, "MMM d, yyyy, h:mm a");
  return prettyDate;
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
  <v-container v-if="!loading">
    <v-row justify="space-between" align="center" class="my-4 mx-1">
      <v-btn @click="goBack" variant="text" prepend-icon="mdi-check-circle">
        <template v-slot:prepend>
          <v-icon size="x-large">mdi-arrow-left</v-icon>
        </template>
        <h2>{{ className }} Quiz List</h2>
      </v-btn>
      <v-btn
        color="primary"
        v-if="userRole === 'professor' || userRole === 'admin'"
        @click="openAddQuizDialog"
        >Add Quiz</v-btn
      >
    </v-row>
    <v-list two-line v-if="quizzes.length > 0">
      <v-list-item v-for="quiz in quizzes" :key="quiz.id">
        <v-list-item-content>
          <div role="button" @click="goToQuiz(quiz.id, className)">
            <v-list-item-title>{{ quiz.name }}</v-list-item-title>
            <v-list-item-title>
              Start Time:
              {{ getDateFormat(quiz.start_time) }}</v-list-item-title
            >
            <v-list-item-subtitle class="mb-3">{{
              quiz.description
            }}</v-list-item-subtitle>
          </div>
          <v-list-item-action class="mr-auto text-right justify-end">
            <v-btn
              @click="openQuizInstructions(quiz)"
              class="my-2"
              prepend-icon="mdi-account-plus"
              color="primary"
              v-if="userRole === 'student' && quiz.is_finished === false"
              :disabled="!quiz.is_enabled"
              variant="flat"
            >
              Start Quiz
            </v-btn>
            <v-btn
              class="my-2"
              prepend-icon="mdi-check"
              color="green"
              v-if="userRole === 'student' && quiz.is_finished === true"
              variant="text"
            >
              Quiz completed
            </v-btn>
            <v-btn
              class="my-2 mr-2"
              v-if="userRole === 'student' && quiz.is_finished === true"
              variant="outlined"
              color="primary"
              @click="goToQuiz(quiz.id, className, true)"
            >
              View Results
            </v-btn>
            <v-btn
              @click="updatequicLock(quiz, !quiz.is_enabled)"
              class="my-2 mr-3"
              :prepend-icon="quiz.is_enabled ? 'mdi-lock' : 'mdi-lock-open'"
              color="primary"
              v-if="userRole === 'professor' || userRole === 'admin'"
              variant="flat"
            >
              {{ quiz.is_enabled ? "Lock" : "Unlock" }}
            </v-btn>
            <v-btn
              @click="openDeleteDialog(quiz)"
              class="my-2"
              prepend-icon="mdi-trash-can"
              color="primary"
              v-if="userRole === 'professor' || userRole === 'admin'"
              variant="flat"
            >
              Delete Quiz
            </v-btn>
            <v-btn
              @click="viewQuizReports(quiz)"
              class="my-2 ml-3"
              prepend-icon="mdi-trash-can"
              color="primary"
              v-if="userRole === 'professor' || userRole === 'admin'"
              variant="flat"
            >
              View Quiz Reports
            </v-btn>
            <v-btn
              class="my-2 ml-3"
              @click="downloadQuizReports(quiz.id, quiz.name)"
              prepend-icon="mdi-trash-can"
              color="primary"
              v-if="userRole === 'professor' || userRole === 'admin'"
              variant="flat"
            >
              Download Quiz Reports
            </v-btn>
          </v-list-item-action>
        </v-list-item-content>
        <v-divider
          class="my-4"
          v-if="quiz.id !== quizzes[quizzes.length - 1].id"
        ></v-divider>
      </v-list-item>
    </v-list>
    <div v-else class="text-center pa-4 text-grey">
      No quiz available for this class.
    </div>
    <AddQuizDialog v-model="showAddQuiz" @submit="handleAddQuiz" />
    <CreateQuestionsDialog
      v-model="showCreateQuiz"
      :prefilled-quiz="manualEditQuiz"
      :fetch-quizzes="fetchQuizzes"
    />
    <DeleteConfirmationDialog
      v-model="isDeleteDialogOpen"
      message="Are you sure you want to delete this Quiz?"
      @confirm="deleteQuiz(selectedQuiz.id)"
      @cancel="cancelDelete"
    />
    <InstructionsDialog v-model="showQuizInstructions" @start="beginQuiz" />
  </v-container>
  <v-row justify="center" align="center" class="h-100" v-if="loading">
    <v-col cols="12" class="text-center py-10">
      <v-progress-circular
        :size="50"
        color="primary"
        indeterminate
      ></v-progress-circular>
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
