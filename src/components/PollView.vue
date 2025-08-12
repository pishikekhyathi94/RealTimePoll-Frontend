<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { usePoll } from "../reports/usePoll";
import ClassServices from "../services/ClassServices";
import { BarChart } from "vue-chart-3";
import UserServices from "../services/UserServices";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);
const user = ref([]);
const classesData = ref([]);
const usersData = ref([]);
const recentQuizSubmissions = ref([]);
const questionAnswers = ref({});
const selectedQuiz = ref(null);
const currentIndex = ref(0);
const currentQuestion = ref(null);
const loading = ref(false);
const selectedClass = ref(null);
const quizList = ref([]);

const { socket, participateQuiz, connected, onStudentResponse, connect } = usePoll();

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  await fetchClasses();
  socketSetup();
  await fetchUsers();
  connect();
});

onUnmounted(() => {
  socket.off("newAnswerSubmission");
});

function socketSetup() {
  onStudentResponse((res) => {
    handleStudentQuizSubmits(res);
  });
}

function handleStudentQuizSubmits(res) {
  recentQuizSubmissions.value.unshift({
    studentId: res.studentId,
    option: res.option,
    timestamp: res.timestamp,
  });
  if (!questionAnswers.value[res.questionId]) {
    questionAnswers.value[res.questionId] = {};
  }

  if (!questionAnswers.value[res.questionId][res.option]) {
    res.option.map((opt) => (questionAnswers.value[res.questionId][opt] = 0));
  }

  res.option.map((opt) => questionAnswers.value[res.questionId][opt]++);
  
  if (selectedQuiz.value) {
    const questionIndex = selectedQuiz.value.question.findIndex(
      (q) => q.id == res.questionId
    );
    if (questionIndex !== -1) {
      changeQuestion(questionIndex);
    }
  }
}

function changeQuestion(questionIndex) {
  if (selectedQuiz.value && selectedQuiz.value.question[questionIndex]) {
    currentIndex.value = questionIndex;
    currentQuestion.value = selectedQuiz.value.question[questionIndex];
  }
}

async function fetchClasses() {
  loading.value = true;
  try {
    const response = await ClassServices.getClasses(user.value.id);
    classesData.value = response.data;
  } catch (error) {
    console.error("Error fetching classes:", error);
  } finally {
    loading.value = false;
  }
}

async function fetchUsers() {
  try {
    const response = await UserServices.getUsers();
    usersData.value = response.data.map((user) => ({
      title: `${user.firstName} ${user.lastName}`,
      email: user.email,
      ...user,
    }));
  } catch (error) {
    console.error("Error fetching classes:", error);
  } finally {
  }
}

async function loadQuizzes(classId) {
  try {
    const response = await ClassServices.getQuizzes(classId, user.id);
    quizList.value = response.data || [];
  } catch (error) {
    console.error("Error loading quizzes:", error);
  }
}

function classSelection(classId) {
  if (classId) {
    const classItem = classesData.value.find((c) => c.id === classId);
    selectedClass.value = classItem;
    selectedQuiz.value = null;
    quizList.value = [];
    currentQuestion.value = null;
    currentIndex.value = 0;
    questionAnswers.value = {};
    recentQuizSubmissions.value = [];
    loadQuizzes(classId);
  }
}

function quizSelection(quiz) {
  if (quiz) {
    selectedQuiz.value = quiz;
    currentQuestion.value = quiz?.question[0];
    currentIndex.value = 0;
    questionAnswers.value = {};
    recentQuizSubmissions.value = [];
    participateQuiz(quiz.id);
    onStudentResponse(handleStudentQuizSubmits);
  }
}

function getOptionCount(option) {
  if (
    !currentQuestion.value ||
    !questionAnswers.value[currentQuestion.value.id]
  ) {
    return 0;
  }
  return questionAnswers.value[currentQuestion.value.id][option] || 0;
}

const barChartOptions = computed(() => ({
  indexAxis: "y",
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.dataset.label || "";
          const value = context.raw;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return `${label}: ${value} (${percentage}%)`;
        },
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: {
        display: false,
      },
      ticks: {
        stepSize: 1,
      },
    },
    y: {
      grid: {
        display: false,
      },
    },
  },
}));

const barChartData = computed(() => {
  if (!currentQuestion.value) return null;
  const options = currentQuestion.value.option.map((opt) => opt.name);
  const counts = currentQuestion.value.option.map((opt) =>
    getOptionCount(opt.id)
  );

  return {
    labels: options,
    datasets: [
      {
        label: "Answers",
        data: counts,
        backgroundColor: "#990011",
        borderColor: "#990011",
        borderWidth: 1,
        borderRadius: 3,
      },
    ],
  };
});
</script>
<style scoped>
.connected {
  color: green;
}
.disconnected {
  color: red;
}
</style>

<template>
  <div>
    <h3 class="{{ connected ? 'connected' : 'disconnected' }} mb-3">
      {{ connected ? "Live Poll Connected" : "Live Poll Disconnected" }}
    </h3>
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-text>
            <v-select
              v-model="selectedClass"
              :items="classesData"
              item-title="name"
              item-value="id"
              label="select a class"
              variant="outlined"
              color="primary"
              @update:model-value="classSelection"
            ></v-select>
            <v-select
              v-model="selectedQuiz"
              :items="quizList"
              item-title="name"
              item-value="id"
              label="select a quiz"
              variant="outlined"
              color="primary"
              :disabled="!selectedClass"
              return-object
              @update:model-value="quizSelection"
            ></v-select>
          </v-card-text>
        </v-card>

        <v-card class="mt-4 py-4" v-if="selectedQuiz && currentQuestion">
          <div class="d-flex justify-space-between align-center">
            <v-btn
              icon="mdi-chevron-left"
              variant="text"
              color="primary"
              :disabled="currentIndex === 0"
              @click="changeQuestion(currentIndex - 1)"
            ></v-btn>

            <div class="text-center">
              <h4>{{ currentQuestion?.name }}</h4>
            </div>

            <v-btn
              icon="mdi-chevron-right"
              variant="text"
              color="primary"
              :disabled="currentIndex === selectedQuiz?.question?.length - 1"
              @click="changeQuestion(currentIndex + 1)"
            ></v-btn>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card v-if="selectedQuiz && currentQuestion">
          <v-card-title class="d-flex align-center">
            <span>Submission results of question - {{ currentIndex + 1 }}</span>
          </v-card-title>
          <v-card-text>
            <BarChart
              v-if="barChartData"
              :chart-data="barChartData"
              :options="barChartOptions"
              :height="200"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-card v-if="!selectedClass || !selectedQuiz" class="text-center py-5">
      <p>No Class or Quiz Selected</p>
    </v-card>
  </div>
</template>
