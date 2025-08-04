<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import ClassServices from "../services/ClassServices";

const props = defineProps({
  quiz: Array,
});

const emit = defineEmits(["finished"]);

const show = ref(true);
const questionsCompleted = ref(false);
const index = ref(0);
const selectedQuiz = props?.quiz;
const currentQuestion = ref(props?.quiz?.question?.[index?.value]);
const selectedOptions = ref([]);
const timeLeft = ref(currentQuestion?.value?.timer);
const user = ref(null);
let interval = null;

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
});

async function saveAnswer(qId, answer) {
  let res = false;
  try {
    const payload = {
      userId: user.value.id,
      quizId: props?.quiz?.id,
      questionId: qId,
      optionId: answer,
    };
   res = await ClassServices.saveAnswer(payload).then((res) => {
      if (res?.status === 200) {
        return true
      }else{
        return false
      }
   });
  }catch (error) {
    return false
  }
  return res;
}

async function submitAnswer() {
  clearInterval(interval);
  const res = await saveAnswer(currentQuestion.value.id, selectedOptions.value);
  if(res){
    selectedOptions.value = [];
    if (index.value + 1 < props?.quiz?.question.length) {
      index.value++;
      currentQuestion.value = props?.quiz?.question?.[index.value];
      startTimer();
    } else {
      questionsCompleted.value = true;
      clearInterval(interval);
      currentQuestion.value = null;
    }
  }
}

function startTimer() {
  timeLeft.value = currentQuestion?.value?.timer;
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
  startTimer();
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
    clearInterval(interval);
    currentQuestion.value = null;
  }
}

async function saveOnExit(e) {
  await saveAnswer(currentQuestion.value.id, selectedOptions.value);
  e.preventDefault();
  e.returnValue = "";
}

function closeQuiz() {
  questionsCompleted.value = true;
  show.value = false;
  clearInterval(interval);
  emit("finished");
}
</script>

<template>
  <v-dialog v-model="show" persistent max-width="600px">
    <v-card v-if="currentQuestion" class="py-4 px-2">
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
  </v-dialog>
</template>
