<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import ClassServices from "../services/ClassServices";
import { useRouter } from "vue-router";
import { usePoll } from "../reports/usePoll";

const props = defineProps({
  quiz: Array,
});

const { questionResponse } = usePoll();
const emit = defineEmits(["finished"]);
const router = useRouter();
const show = ref(true);
const questionsCompleted = ref(false);
const index = ref(0);
const selectedQuiz = ref(null);
const currentQuestion = ref(null);
const selectedOptions = ref([]);
const timeLeft = ref(0);
const user = ref(null);
const quizStartQuestion = ref(null);
let interval = null;

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  selectedQuiz.value = JSON.parse(localStorage.getItem("quizStart"));
  quizStartQuestion.value = JSON.parse(
    localStorage.getItem("quizStartQuestion")
  );
  if (
    selectedQuiz?.value?.question?.length > 0 &&
    quizStartQuestion?.value?.question
  ) {
    const getQuestion = selectedQuiz?.value?.question?.find(
      (q) => q.id === quizStartQuestion?.value?.question?.id
    );
    const getQuestionIndex = selectedQuiz?.value?.question?.findIndex(
      (q) => q.id === quizStartQuestion?.value?.question?.id
    );
    currentQuestion.value =
      getQuestion || selectedQuiz?.value?.question?.[index?.value];
    timeLeft.value =
      quizStartQuestion?.value?.timeLeftForCurrentQuestion ||
      currentQuestion?.value?.timer;
    index.value = getQuestionIndex;
  } else {
    questionsCompleted.value = true;
  }
});

async function saveAnswer(qId, answer) {
  let res = false;
  try {
    const payload = {
      userId: user.value.id,
      quizId: selectedQuiz.value.id,
      questionId: qId,
      optionId: answer,
    };
    res = await ClassServices.saveAnswer(payload).then((res) => {
      if (res?.status === 200) {
        questionResponse(selectedQuiz.value.id, qId, answer, user.value.id);
        return true;
      } else {
        return false;
      }
    });
  } catch (error) {
    return false;
  }
  return res;
}

async function submitAnswer() {
  clearInterval(interval);
  const res = await saveAnswer(currentQuestion.value.id, selectedOptions.value);
  if (res) {
    selectedOptions.value = [];
    if (index.value + 1 < selectedQuiz?.value?.question.length) {
      index.value++;
      currentQuestion.value = selectedQuiz?.value?.question?.[index.value];
      startTimer();
    } else {
      questionsCompleted.value = true;
      clearInterval(interval);
      currentQuestion.value = null;
      emit("finished");
      window.localStorage.removeItem("quizStart");
    }
  }
}

function startTimer(isTimerStarted = false) {
  timeLeft.value = isTimerStarted
    ? timeLeft.value
    : currentQuestion?.value?.timer;
  interval = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value === 0) {
      submitAnswer();
    }
  }, 1000);
}

onMounted(() => {
  window.addEventListener("beforeunload", saveOnExit);
  document.addEventListener("visibilitychange", handleTabChange);
  startTimer(true);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", saveOnExit);
  document.removeEventListener("visibilitychange", handleTabChange);
  clearInterval(interval);
});

function handleTabChange() {
  if (document.visibilityState === "hidden") {
    alert("You left the tab! The quiz will end.");
    questionsCompleted.value = true;
    window.localStorage.removeItem("quizStart");
    clearInterval(interval);
    currentQuestion.value = null;
    emit("finished");
  }
}

async function saveOnExit(e) {
  await saveAnswer(currentQuestion.value.id, selectedOptions.value);
  e.preventDefault();
  e.returnValue = "";
  emit("finished");
  window.localStorage.removeItem("quizStart");
}

function closeQuiz() {
  questionsCompleted.value = true;
  show.value = false;
  clearInterval(interval);
  router.go(-1);
}
</script>

<template>
  <v-card v-if="currentQuestion" class="py-4 px-2 h-100">
    <v-card-title>
      <div class="d-flex align-center justify-space-between">
        <p class="d-flex flex-column">
          <span>{{ selectedQuiz?.name }}</span>
          <span
            >Question {{ index + 1 }} out of
            {{ selectedQuiz?.question?.length }}</span
          >
        </p>
        <p class="mb-2">
          <v-icon
            size="small"
            color="primary"
            icon="mdi-clock-outline"
          ></v-icon>
          {{ timeLeft }}s
        </p>
      </div>
      <v-spacer />
    </v-card-title>
    <v-card-text>
      <p>{{ currentQuestion.name }}</p>
      <v-checkbox
        v-for="(opt, index) in currentQuestion.option"
        :key="index"
        :label="opt?.name"
        :value="opt?.id"
        v-model="selectedOptions"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn
        :disabled="selectedOptions.length === 0"
        color="primary"
        variant="flat"
        @click="submitAnswer"
      >
        submit
      </v-btn>
    </v-card-actions>
  </v-card>
  <v-card v-else-if="questionsCompleted" class="text-center pa-6">
    <v-card-title class="text-h5 mb-4">Quiz Completed</v-card-title>
    <p class="mb-4">You have completed the quiz, close this window.</p>
    <v-btn color="primary" variant="flat" @click="closeQuiz">Close</v-btn>
  </v-card>
</template>
