<script setup>
defineProps(["modelValue"]);
const emit =  defineEmits(["start"]);
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    persistent
    width="500"
  >
    <v-card>
      <v-card-title class="text-h6">Quiz Instructions</v-card-title>
      <v-card-text>
        <ul style="list-style: decimal;" class="pl-5">
          <li class="mb-1">Each question has a timer.</li>
          <li class="mb-1">No back button available.</li>
          <li class="mb-1">
            Do not refresh, change tab, or close the browser — your quiz will
            end.
          </li>
          <li>Answers are saved immediately on each question.</li>
        </ul>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="$emit('start')">Take Quiz</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
