<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: Boolean,
  isEdit: Boolean,
  question: Object,
});

const emit = defineEmits(["update:modelValue", "updateQuestion"]);

const editedQuestion = ref({
  name: "",
  timer: 0,
  option: [],
});

const questionError = ref(false);
const timerError = ref(false);
const correctOptionError = ref(false);
const optionErrors = ref([]);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

watch(
  () => props.question,
  (newQuestion) => {
    if (newQuestion) {
      editedQuestion.value = JSON.parse(JSON.stringify(newQuestion));
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => props.modelValue,
  (val) => {
    if (val && props.question) {
      editedQuestion.value = JSON.parse(JSON.stringify(props.question));
      questionError.value = false;
      timerError.value = false;
      correctOptionError.value = false;
      optionErrors.value = props?.question?.option.map(() => false);
    }
  }
);

function close() {
  questionError.value = false;
  timerError.value = false;
  correctOptionError.value = false;
  optionErrors.value = [];
  emit("update:modelValue", false);
}

function validateForm() {
  const questionValid = editedQuestion.value.name.trim() !== "";
  const timerValid = editedQuestion.value.timer > 0;
  const atLeastOneCorrect = editedQuestion.value.option.some(
    (opt) => opt.correctOption
  );

  questionError.value = !questionValid;
  timerError.value = !timerValid;
  correctOptionError.value = !atLeastOneCorrect;

  optionErrors.value = editedQuestion.value.option.map(
    (opt) => !opt.name || opt.name.trim() === ""
  );

  const optionsValid = !optionErrors.value.includes(true);

  return questionValid && timerValid && atLeastOneCorrect && optionsValid;
}

function removeOption(optionIndex) {
  if (editedQuestion?.value?.option?.length > 2) {
    editedQuestion?.value?.option?.splice(optionIndex, 1);
    optionErrors?.value?.[optionIndex]?.splice(optionIndex, 1);
  } else {
    snackbar.value = {
      value: true,
      text: "At least one question is required.",
      color: "red",
    };
  }
}

function update() {
  if (validateForm()) {
    emit("updateQuestion", editedQuestion.value);
    emit("update:modelValue", false);
  }
}
</script>
<template>
  <v-dialog
    :model-value="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    max-width="600"
  >
    <v-card>
      <v-card-title>{{isEdit ? "Edit" : "Add"}} Question</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="editedQuestion.name"
          label="Question Text"
          :error="questionError"
          :error-messages="questionError ? 'Question is required' : ''"
          required
        />
        <v-text-field
          v-model.number="editedQuestion.timer"
          label="Timer (in seconds)"
          type="number"
          :error="timerError"
          :error-messages="timerError ? 'Timer must be greater than 0' : ''"
          required
        />
        <v-divider class="my-2" />

        <v-list dense>
          <v-list-item
            v-for="(option, index) in editedQuestion.option"
            :key="index"
          >
            <v-row>
              <v-col cols="9">
                <v-text-field
                  v-model="option.name"
                  :label="`Option ${index + 1}`"
                  :error="optionErrors[index]"
                  :error-messages="
                    optionErrors[index] ? 'Option is required' : ''
                  "
                  required
                />
              </v-col>
              <v-col cols="2" class="d-flex align-center justify-center">
                <v-checkbox
                  v-model="option.correctOption"
                  hide-details
                  color="green"
                />
              </v-col>
              <v-col cols="1" class="d-flex align-center justify-center">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="red"
                  @click="removeOption(index)"
                  :disabled="editedQuestion.option.length <= 2"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-list-item>
        </v-list>
        <v-row>
          <v-btn
            small
            color="primary"
            variant="text"
            class="mt-2"
            @click="
              editedQuestion?.option.push({
                option: '',
                is_correct: false,
              })
            "
          >
            + Add Option
          </v-btn>
        </v-row>
        <v-alert
          type="error"
          class="mt-2"
          v-if="correctOptionError"
          density="compact"
        >
          Please select at least one correct option.
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">Cancel</v-btn>
        <v-btn color="primary" @click="update">{{ isEdit ? "Update" : "Add" }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-snackbar v-model="snackbar.value" :color="snackbar.color" timeout="3000">
    <span class="text-black">{{ snackbar.text }}</span>
  </v-snackbar>
</template>
