<script setup>
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import ClassServices from "../services/ClassServices.js";

const router = useRouter();
const route = useRoute();
const tab = ref(1);
const user = ref(null);
const classesData = ref([]);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  tab.value = route.query.tab ? parseInt(route.query.tab) : 1;
  router.replace({ query: {} });
});

watch(tab, async (newTab) => {
  if (user && newTab === 2) {
    await fetchClasses();
  }
});

function closeSnackBar() {
  snackbar.value.value = false;
}

async function fetchClasses() {
  try {
   await ClassServices.getClassesForUser(user.value.id).then(async (response) => {
      if (response?.status === 200) {
         classesData.value = response.data;
      }
    })
  } catch (error) {
   snackbar.value.value = true;
   snackbar.value.color = "error";
   snackbar.value.text =
        error?.response?.data?.message ||
        "An error occurred while getting the classes";
  }
}

async function registerForClass(classId) {
  try {
    await ClassServices.getRegisterForClasses({
      classId: classId,
      userId: user.value.id,
    }).then(async (response) => {
      if (response?.status === 200) {
        snackbar.value.value = true;
        snackbar.value.color = "green";
        snackbar.value.text = `user registered successfully!`;
        await fetchClasses();
      }
    });
  } catch (error) {
    snackbar.value.value = true;
    snackbar.value.color = "red";
    snackbar.value.text = `Error registering for class: ${error.message}`;
  }
}

function classDetails(cls) {
  if(cls?.isRegistered && cls?.id){
    router.push({ name: "classDetails", params: { classId: cls?.id } });
  }
}
</script>

<style>
.header-btn .v-btn__content {
  font-weight: 600;
}
</style>

<template>
  <router-view />
  <v-row class="px-3 pt-4" align="center">
    <v-col cols="10">
      <v-tabs v-model="tab" align-tabs="left" color="primary" class="mb-4 px-6">
        <v-tab :value="1">Live Poll</v-tab>
        <v-tab :value="2">Classes</v-tab>
        <v-tab :value="3">Results</v-tab>
      </v-tabs>
    </v-col>
  </v-row>
  <v-row>
    <div v-if="!user">
      <p class="text-center">Please log in to manage your classes.</p>
    </div>
    <v-col cols="11" class="mx-auto">
      <v-tabs-window v-model="tab">
        <v-tabs-window-item :key="1" :value="1">
          <v-container>
            <v-row>
              <v-col cols="12">
                <p>live poll</p>
              </v-col>
            </v-row>
          </v-container>
        </v-tabs-window-item>
        <v-tabs-window-item :key="2" :value="2">
          <v-container>
            <v-row>
              <div
                v-if="!classesData?.length"
                class="text-center pa-4 text-grey"
              >
                No classes to register.
              </div>
              <v-col cols="12" class="d-flex flex-wrap gap-4">
                <div
                  v-for="cls in classesData"
                  :key="cls.id"
                  class="d-flex align-center"
                >
                  <v-card
                    class="mx-4 mb-2"
                    max-width="250"
                    min-width="250"
                    hover
                  >
                    <v-img
                      height="200"
                      :src="`/class.jpg`"
                      class="book-cover-image"
                      @click="classDetails(cls)"
                    ></v-img>

                    <v-card-item @click="classDetails(cls)">
                      <v-card-title class="text-h5 font-weight-bold">{{
                        cls?.name
                      }}</v-card-title>
                    </v-card-item>
                    <v-card-actions>
                      <v-col cols="12" class="d-flex pa-0 justify-center">
                        <v-btn
                          @click="registerForClass(cls?.id)"
                          class="my-2"
                          prepend-icon="mdi-account-plus"
                          color="primary"
                          v-if="!cls?.isRegistered"
                          variant="flat"
                        >
                          Register Class
                        </v-btn>
                        <v-btn
                          @click="registerForClass(cls?.id)"
                          class="my-2"
                          prepend-icon="mdi-check"
                          color="primary"
                          v-if="cls?.isRegistered"
                          variant="flat"
                          disabled="true"
                        >
                           Registered
                        </v-btn>
                      </v-col>
                    </v-card-actions>
                  </v-card>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-tabs-window-item>
        <v-tabs-window-item :key="3" :value="3">
          <v-container>
            <v-row>
              <v-col cols="12" class="pa-0">
                <p>result</p>
              </v-col>
            </v-row>
          </v-container>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-col>
  </v-row>
  <v-snackbar v-model="snackbar.value" rounded="pill">
    {{ snackbar.text }}
    <template v-slot:actions>
      <v-btn :color="snackbar.color" variant="text" @click="closeSnackBar()">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>
