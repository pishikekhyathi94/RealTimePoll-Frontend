<script setup>
import { defineProps, defineEmits } from "vue";

defineProps({
  modelValue: Boolean,
  message: String,
});

const emit = defineEmits(["update:modelValue", "confirm", "cancel"]);

function closeDialog() {
  emit("update:modelValue", false);
}

function confirmAction() {
  emit("confirm");
  closeDialog();
}

// Cancel the action
function cancelAction() {
  emit("cancel");
  closeDialog();
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    max-width="400px"
  >
    <v-card>
      <v-card-title class="text-h6">Confirm Deletion</v-card-title>
      <v-card-text>
        {{ message }}
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary header-btn" variant="flat" text @click="confirmAction"
          >Yes</v-btn
        >
        <v-btn variant="outlined" color="primary header-btn" text @click="cancelAction"
          >No</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
