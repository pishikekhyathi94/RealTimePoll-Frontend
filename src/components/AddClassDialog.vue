<script setup>
import { ref, watch } from "vue";

const newClass = ref({
  name: "",
  noOfStudents: 0,
});
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const props = defineProps({
  modelValue: Boolean,
  isEdit: Boolean,
  selectedClass: Object,
});
const emit = defineEmits([
  "update:modelValue",
  "submit",
  "update:selectedClass",
  "update:isEdit",
]);

watch(
  () => props.selectedClass,
  (newVal) => {
    if (props.isEdit && newVal) {
      newClass.value = {
        name: newVal.name || "",
        noOfStudents: newVal.description || 0,
      };
    }
  },
  { immediate: true, deep: true }
);

function closeAddDialog() {
  emit("update:modelValue", false);
}

function submit() {
  if (newClass.value.name.trim() !== "" && newClass.value.noOfStudents > 0) {
    emit("submit", {
      name: newClass.value.name.trim(),
      noOfStudents: newClass.value.noOfStudents,
    });
    emit("update:modelValue", false);
    newClass.value.name = "";
    newClass.value.noOfStudents = 0;
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
      <v-card-title class="headline mb-2">{{
        isEdit ? "Edit Class" : "Create a New Class"
      }}</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="newClass.name"
          label="Class Name (e.g., CS 101 - Intro to Programming)"
          required
        ></v-text-field>
        <v-text-field
          v-model="newClass.noOfStudents"
          label="Number of Students"
          type="number"
          required
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="closeAddDialog">Cancel</v-btn>
        <v-btn color="primary" variant="flat" @click="submit">
          {{ isEdit ? "Update Class" : "Create Class" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-snackbar v-model="snackbar.value" :color="snackbar.color" timeout="3000">
    <span class="text-black">{{ snackbar.text }}</span>
  </v-snackbar>
</template>
