<script setup>
import { ref, onMounted } from "vue";
import ClassServices from "../services/ClassServices.js";

const classes = ref([]);
const user = ref(null);
const isAddDialogOpen = ref(false);
const newClass = ref({ name: "" });
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    user.value = JSON.parse(storedUser);
    getClasses();
  }
});

async function getClasses() {
  if (!user.value || !user.value.id) {
    console.error("User ID not found, cannot fetch classes.");
    return;
  }

  try {
    const response = await ClassServices.getClasses(user.value.id);
    classes.value = response.data;
  } catch (error) {
    console.error(error);
    showSnackbar("error", "Failed to load classes.");
  }
}

async function addClass() {
  if (!newClass.value.name.trim()) {
    showSnackbar("error", "Class name cannot be empty.");
    return;
  }
  if (!user.value || !user.value.id) {
    showSnackbar("error", "You must be logged in to add a class.");
    return;
  }

  try {
    const payload = {
      name: newClass.value.name,
      userId: user.value.id,
    };
    await ClassServices.addClass(payload);
    showSnackbar("grey-lighten-3", "Class added successfully!");
    closeAddDialog();
    getClasses();
  } catch (error) {
    console.error(error);
    showSnackbar("error", "Failed to add class.");
  }
}

function deleteClass(classId) {
  classes.value = classes.value.filter((cls) => cls.id !== classId);
  showSnackbar("grey-lighten-3", "Class deleted");
}

function openAddDialog() {
  newClass.value.name = "";
  isAddDialogOpen.value = true;
}

function closeAddDialog() {
  isAddDialogOpen.value = false;
}

function showSnackbar(color, text) {
  snackbar.value.color = color;
  snackbar.value.text = text;
  snackbar.value.value = true;
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div v-if="!user">
           <p class="text-center">Please log in to manage your classes.</p>
        </div>
        <div v-else>
          <div class="d-flex justify-space-between align-center mb-4">
            <h1 class="text-h4">My Classes</h1>
            <v-btn color="primary" prepend-icon="mdi-plus-box" @click="openAddDialog">New Class</v-btn>
          </div>
          <v-card variant="outlined" rounded="xl">
            <v-list lines="one">
              <div v-if="!classes.length" class="text-center pa-4 text-grey">
                  You haven't created any classes yet.
              </div>
              <div v-for="(cls, index) in classes" :key="cls.id">
                <v-list-item :title="cls.name" link>
                  <template v-slot:append>
                    <v-btn icon="mdi-delete-outline" variant="text" color="grey-lighten-1" @click.stop="deleteClass(cls.id)"></v-btn>
                  </template>
                </v-list-item>
                <v-divider v-if="index < classes.length - 1"></v-divider>
              </div>
            </v-list>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <v-dialog persistent v-model="isAddDialogOpen" width="500">
      <v-card>
        <v-card-title class="headline mb-2">Create a New Class</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newClass.name"
            label="Class Name (e.g., CS 101 - Intro to Programming)"
            required
            @keyup.enter="addClass"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeAddDialog">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="addClass">Create Class</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.value" :color="snackbar.color" timeout="3000">
      <span class="text-black">{{ snackbar.text }}</span>
    </v-snackbar>
  </v-container>
</template>
