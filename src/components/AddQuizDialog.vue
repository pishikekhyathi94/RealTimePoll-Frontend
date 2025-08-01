<script setup>
import { ref } from "vue";

const newQuizz = ref({ name: "", title: "", description: "" });
const tab = ref(1);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const props = defineProps({
  modelValue: Boolean,
});
const emit = defineEmits(["update:modelValue", "submit"]);

function closeAddDialog() {
  tab.value = 1;
  newQuizz.value = { name: "", title: "", description: "" };
  emit("update:modelValue", false);
}

function submit() {
  if (newQuizz.value.name.trim() !== "") {
    emit("submit", {
      name: newQuizz.value.name.trim(),
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
      <v-card-text>
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
    </v-card>
  </v-dialog>
  <v-snackbar v-model="snackbar.value" :color="snackbar.color" timeout="3000">
    <span class="text-black">{{ snackbar.text }}</span>
  </v-snackbar>
</template>
