<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import ClassServices from "../services/ClassServices.js";

const route = useRoute();
const router = useRouter();
const expandedReport = ref(null);
const user = ref(null);
const reports = ref([]);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const quizId = route.params.quizId;

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  await getAuthors();
});

async function getAuthors() {
  await ClassServices.getQuizReports(quizId)
    .then((response) => {
      reports.value = response.data.reports;
    })
    .catch((error) => {
      console.log(error);
    });
}

function closeSnackBar() {
  snackbar.value.value = false;
}

function toggleDetails(reportId) {
  expandedReport.value = expandedReport.value === reportId ? null : reportId;
}

function goBack() {
  router.go(-1);
}

defineExpose({ getAuthors });
</script>

<template>
  <v-row justify="space-between" align="center" class="my-4 mx-1">
    <v-btn @click="goBack" variant="text" prepend-icon="mdi-check-circle">
      <template v-slot:prepend>
        <v-icon size="x-large">mdi-arrow-left</v-icon>
      </template>
      {{ reports?.[0]?.quiz_details?.name }}
    </v-btn>
  </v-row>
  <div v-if="reports.length > 0">
    <v-card
      class="rounded-lg elevation-5 mb-5 mx-6 mt-6"
      v-for="report in reports"
      :key="report.id"
      @click="toggleDetails(report.id)"
    >
      <v-card-title class="headline">
        <v-row align="center">
          <v-col cols="10">
            <v-chip class="ma-2" color="primary" label>
              <v-icon start icon="mdi-account"></v-icon>
              {{ report?.firstName + " " + report?.lastName }}
            </v-chip>
            <v-chip class="ma-2" color="accent" label>
              <v-icon start icon="mdi-email"></v-icon>
              {{ report?.email }}
            </v-chip>
          </v-col>
          <v-col class="d-flex justify-end">
            <v-icon
              size="small"
              icon="mdi-menu-up"
              class="mr-4"
              v-if="expandedReport === report.id"
            ></v-icon>
            <v-icon
              size="small"
              icon="mdi-menu-down"
              class="mr-4"
              v-else
            ></v-icon>
          </v-col>
        </v-row>
      </v-card-title>
      <v-expand-transition>
        <div v-show="expandedReport === report.id">
          <v-list dense>
            <v-list-item
              v-for="question in report?.questions"
              :key="question?.questionId"
              class="mb-4"
            >
              <v-card-title>
                {{ question?.question }}
              </v-card-title>
              <v-card-text>
                <v-list dense>
                  <v-list-item
                    v-for="option in question?.options"
                    :key="option.id"
                    :class="option.correctOption ? 'bg-green-lighten-4' : option?.user_selected ? 'bg-red-lighten-4' : ''"
                  >
                    <v-list-item-content>{{ option.name }}</v-list-item-content>
                    <v-list-item-icon
                      class="ml-3"
                      v-if="option.correctOption && option.user_selected"
                    >
                      <v-icon color="green" icon="mdi-check-bold"></v-icon>
                    </v-list-item-icon>
                    <v-list-item-icon
                      class="ml-3"
                      v-if="option.correctOption && !option.user_selected"
                    >
                      <v-icon color="red" icon="mdi-close-thick"></v-icon>
                    </v-list-item-icon>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-list-item>
          </v-list>
        </div>
      </v-expand-transition>
    </v-card>
  </div>
  <div v-else class="text-center my-5">
    <v-card-title class="headline text-center"> No reports found </v-card-title>
  </div>
  <v-snackbar v-model="snackbar.value" rounded="pill">
    {{ snackbar.text }}
    <template v-slot:actions>
      <v-btn :color="snackbar.color" variant="text" @click="closeSnackBar()">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>
