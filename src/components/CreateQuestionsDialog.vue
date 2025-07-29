<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import ClassServices from "../services/ClassServices";

const props = defineProps({
  fetchQuizzes: Function,
});

const questions = ref([
  {
    question: "",
    timer: 0,
    options: [
      { option: "", is_correct: false },
      { option: "", is_correct: false },
      { option: "", is_correct: false },
      { option: "", is_correct: false },
    ],
  },
]);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const route = useRoute();
const title = ref(null);
const user = ref(null);
const description = ref(null);
const emit = defineEmits(["closeAddDialog", "fetchQuizzes"]);
const classId = route.params.classId;

const questionErrors = ref([]);
const timerErrors = ref([]);
const correctOptionErrors = ref([]);
const optionErrorsList = ref([]);
const titleError = ref(false);
const descriptionError = ref(false);

function resetValidation() {
  title.value = null;
  description.value = null;
  questionErrors.value = [];
  timerErrors.value = [];
  correctOptionErrors.value = [];
  optionErrorsList.value = [];
  titleError.value = false;
  descriptionError.value = false;
}

onMounted(() => {
    user.value = JSON.parse(localStorage.getItem("user"));  
  resetValidation();
  questionErrors.value = questions.value.map(() => false);
  timerErrors.value = questions.value.map(() => false);
  correctOptionErrors.value = questions.value.map(() => false);
  optionErrorsList.value = questions.value.map((q) =>
    q.options.map(() => false)
  );
});

watch(
  questions,
  (newVal) => {
    questionErrors.value = newVal.map(
      (q, i) => questionErrors.value[i] || false
    );
    timerErrors.value = newVal.map((q, i) => timerErrors.value[i] || false);
    correctOptionErrors.value = newVal.map(
      (q, i) => correctOptionErrors.value[i] || false
    );
    optionErrorsList.value = newVal.map((q, i) => {
      return q.options.map((_, j) => optionErrorsList.value[i]?.[j] || false);
    });
  },
  { deep: true }
);

function close() {
  questions.value = [
    {
      question: "",
      timer: 0,
      options: [
        { option: "", is_correct: false },
        { option: "", is_correct: false },
        { option: "", is_correct: false },
        { option: "", is_correct: false },
      ],
    },
  ];
  resetValidation();
  emit("closeAddDialog");
}

function validateQuestion(question, index) {
  const isTitleValid = title.value ? title.value.trim() !== "" : false;
  const isDescriptionValid = description.value
    ? description.value.trim() !== ""
    : false;
  const isQuestionValid = question.question.trim() !== "";
  const isTimerValid = question.timer > 0;
  const hasCorrectOption = question.options.some(
    (opt) => opt.is_correct && opt.option.trim() !== ""
  );
  const filledOptionIndexes = question.options
    .map((opt, idx) => (opt.option && opt.option.trim() !== "" ? idx : -1))
    .filter((idx) => idx !== -1);
  const areOptionsValid = filledOptionIndexes.length >= 2;
  optionErrorsList.value[index] = question.options.map((opt, idx) => {
    if (filledOptionIndexes.length >= 2) return false;
    return !opt.option || opt.option.trim() === "";
  });
  questionErrors.value[index] = !isQuestionValid;
  timerErrors.value[index] = !isTimerValid;
  correctOptionErrors.value[index] = !hasCorrectOption;
  titleError.value = !isTitleValid;
  descriptionError.value = !isDescriptionValid;

  return (
    isQuestionValid &&
    isTimerValid &&
    hasCorrectOption &&
    areOptionsValid &&
    isDescriptionValid &&
    isTitleValid
  );
}

function validateAll() {
  return questions.value.every((q, index) => validateQuestion(q, index));
}

function addQuestion() {
  if (!validateAll()) {
    return;
  }
  const newQuestion = {
    question: "",
    timer: 0,
    options: [
      { option: "", is_correct: false },
      { option: "", is_correct: false },
      { option: "", is_correct: false },
      { option: "", is_correct: false },
    ],
  };
  questions.value.push(newQuestion);
  questionErrors.value.push(false);
  timerErrors.value.push(false);
  correctOptionErrors.value.push(false);
  optionErrorsList.value.push(newQuestion.options.map(() => false));
}

async function saveAll() {
  if (validateAll()) {
    const payload = {
      title: title.value,
      description: description.value,
      questions: questions.value,
      userId: user.value.id,
      classId: classId,
      is_enables: false,
      category: "manual",
    };
    await ClassServices.addManualQuiz(payload)
    .then(async (response) => {
        if (response?.status === 200) {
          await props.fetchQuizzes();
          emit("closeAddDialog");
          snackbar.value.value = true;
          snackbar.value.color = "green";
          snackbar.value.text = `${response?.data?.title} added successfully!`;
        }
      })
      .catch((error) => {
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = "Failed to add quiz.";
      });
    close();
  }
}
</script>

<template>
  <v-card style="max-height: 50vh; overflow-y: auto">
    <v-card-title>Create Questions</v-card-title>
    <v-card-text>
      <v-text-field
        v-model="title"
        label="Quiz Title"
        :error="titleError"
        :error-messages="titleError ? 'Title is required' : ''"
        required
      />
      <v-text-field
        v-model="description"
        label="Quiz Description"
        :error="descriptionError"
        :error-messages="descriptionError ? 'Description is required' : ''"
        required
      />
      <div v-for="(question, index) in questions" :key="index" class="mb-6">
        <h4 class="text-subtitle-1 mb-2">Question {{ index + 1 }}</h4>
        <v-text-field
          v-model="question.question"
          label="Question Title"
          :error="questionErrors[index]"
          :error-messages="questionErrors[index] ? 'Question is required' : ''"
          required
        />
        <v-text-field
          v-model.number="question.timer"
          label="Timer (in seconds)"
          type="number"
          :error="timerErrors[index]"
          :error-messages="
            timerErrors[index] ? 'Timer must be greater than 0' : ''
          "
          required
        />
        <v-list dense>
          <v-list-item
            v-for="(option, optIndex) in question.options"
            :key="optIndex"
          >
            <v-row>
              <v-col cols="10">
                <v-text-field
                  v-model="option.option"
                  :label="`Option ${optIndex + 1}`"
                  :error="optionErrorsList?.[index]?.[optIndex]"
                  :error-messages="
                    optionErrorsList?.[index]?.[optIndex]
                      ? 'Option is required'
                      : ''
                  "
                  required
                />
              </v-col>
              <v-col cols="2" class="d-flex align-center justify-center">
                <v-checkbox
                  v-model="option.is_correct"
                  hide-details
                  color="green"
                />
              </v-col>
            </v-row>
          </v-list-item>
        </v-list>
        <v-alert
          type="error"
          class="mt-2"
          v-if="correctOptionErrors[index]"
          density="compact"
        >
          Please select at least one correct option.
        </v-alert>

        <v-divider class="my-4" />
      </div>
    </v-card-text>

    <v-card-actions>
      <v-btn color="blue-grey" variant="text" @click="addQuestion">
        + Add Another Question
      </v-btn>
      <v-spacer />
      <v-btn variant="text" @click="close">Cancel</v-btn>
      <v-btn color="primary" @click="saveAll">Save All</v-btn>
    </v-card-actions>
  </v-card>
   <v-snackbar v-model="snackbar.value" :color="snackbar.color" timeout="3000">
    <span class="text-black">{{ snackbar.text }}</span>
  </v-snackbar>
</template>
