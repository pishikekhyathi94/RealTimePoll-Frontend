<script setup>
import { ref } from "vue";
import CreateQuestionsDialog from "./CreateQuestionsDialog.vue";

const newQuizz = ref({ name: "", title: "", description: "" });
const tab = ref(1);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const props = defineProps({
  modelValue: Boolean,
  fetchQuizzes: Function,
});
const emit = defineEmits(["update:modelValue", "submit"]);

function closeAddDialog() {
  tab.value = 1;
  newQuizz.value = { name: "", title: "", description: "" };
  emit("update:modelValue", false);
}

function submit() {
  if (
    newQuizz.value.name.trim() !== "" &&
    newQuizz.value.title.trim() !== "" &&
    newQuizz.value.description.trim() !== ""
  ) {
    emit("submit", {
      name: newQuizz.value.name.trim(),
      title: newQuizz.value.title.trim(),
      description: newQuizz.value.description.trim(),
    });
    emit("update:modelValue", false);
    newQuizz.value.name = "";
    newQuizz.value.title = "";
    newQuizz.value.description = "";
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
      <v-card-title class="headline mb-2">Create a Quizz</v-card-title>
      <v-row class="px-3 pt-4" align="center">
        <v-col cols="10">
          <v-tabs
            v-model="tab"
            align-tabs="left"
            color="primary"
            class="mb-4 px-6"
          >
            <v-tab :value="1">AI quiz</v-tab>
            <v-tab :value="2">Manual quiz</v-tab>
          </v-tabs>
        </v-col>
      </v-row>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item :key="1" :value="1">
          <v-card-text>
            <v-text-field
              v-model="newQuizz.title"
              label="Title"
              required
            ></v-text-field>
            <v-text-field
              v-model="newQuizz.description"
              label="Description"
              required
            ></v-text-field>
            <v-text-field
              v-model="newQuizz.name"
              label="Prompt"
              required
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="closeAddDialog">Cancel</v-btn>
            <v-btn color="primary" variant="flat" @click="submit">
              Create Quizz
            </v-btn>
          </v-card-actions>
        </v-tabs-window-item>
        <v-tabs-window-item :key="2" :value="2">
          <CreateQuestionsDialog
            @closeAddDialog="closeAddDialog"
            :fetch-quizzes="fetchQuizzes"
          />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card>
  </v-dialog>
  <v-snackbar v-model="snackbar.value" :color="snackbar.color" timeout="3000">
    <span class="text-black">{{ snackbar.text }}</span>
  </v-snackbar>
</template>
