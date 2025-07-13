<script setup>
import { onMounted } from "vue";
import { ref, toRaw } from "vue";
import { useRouter } from "vue-router";
import UserServices from "../services/UserServices.js";

const router = useRouter();
const isCreateAccount = ref(false);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const user = ref({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
});

const inputRules = ref({
    required: [v => !!v || 'Text Required'],
    email: [
        v => !!v || 'Text Required',
        value => {
            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return pattern.test(value) || 'Invalid e-mail address';
        },
    ],
    pass: [
        v => !!v || 'Text Required',
    ],
     password: [
    v => !!v || 'Text Required',
    value => value.length >= 8 || 'Password must be at least 8 characters',
    value => /[A-Z]/.test(value) || 'Password must contain at least one uppercase letter',
    value => /[0-9]/.test(value) || 'Password must contain at least one number',
    value => /[!@#$%^&*(),.?":{}|<>]/.test(value) || 'Password must contain at least one special character',
  ],
});

onMounted(async () => {
  localStorage.removeItem("user");
  // if (localStorage.getItem("user") !== null) {
  //   router.push({ name: "recipes" });
  // }
});

function navigateToRecipes() {
  router.push({ name: "recipes" });
}

async function createAccount() {
  await UserServices.addUser(user.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Account created successfully!";
      router.push({ name: "login" });
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

async function login() {
  await UserServices.loginUser(user)
    .then((data) => {
      window.localStorage.setItem("user", JSON.stringify(data.data));
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Login successful!";
      router.push({ name: "recipes" });
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

function openCreateAccount() {
  isCreateAccount.value = true;
}

function closeCreateAccount() {
  isCreateAccount.value = false;
}

function closeSnackBar() {
  snackbar.value.value = false;
}
</script>

<template>
  <v-container>  
    <div id="body" class="signin-body-container">
      <v-form ref="loginFormRef">
        <v-card class="rounded-lg elevation-5" width="650">
          <v-card-title class="headline mb-2">Login</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="user.email"
              label="Email"
              :rules="inputRules.email"
              class="required-field"
              required
            ></v-text-field>

            <v-text-field
              v-model="user.password"
              label="Password"
              type="password"
              :rules="inputRules.pass"
              class="required-field"
              required
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
           <v-btn variant="flat" color="secondary" @click="openCreateAccount()">
              Create Account
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn variant="flat" color="primary" @click="login()">Login</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>

        <v-dialog persistent v-model="isCreateAccount" width="800">
                <v-card class="rounded-lg elevation-5">
                    <v-card-title class="headline mb-2">Sign Up </v-card-title>
                    <v-form @submit.prevent="createAccount()" ref="createAccountFormRef">
                        <v-card-text>
                            <v-text-field v-model="user.firstName" label="First Name" :rules="inputRules.required" class="required-field"></v-text-field>

                            <v-text-field v-model="user.lastName" label="Last Name" :rules="inputRules.required" class="required-field"></v-text-field>

                            <v-text-field v-model="user.email" label="Email" :rules="inputRules.email" class="required-field"></v-text-field>

                            <v-text-field v-model="user.password" label="Password" type="password" :rules="inputRules.password" class="required-field"></v-text-field>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn variant="flat" color="secondary" @click="closeCreateAccount()">Close</v-btn>
                            <v-btn variant="flat" color="primary" type="submit">Create Account</v-btn>
                        </v-card-actions>
                    </v-form>
                </v-card>
            </v-dialog>

      <v-snackbar v-model="snackbar.value" rounded="pill">
        {{ snackbar.text }}

        <template v-slot:actions>
          <v-btn
            :color="snackbar.color"
            variant="text"
            @click="closeSnackBar()"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </div>
  </v-container>
</template>


<style scoped>
.signin-bg {
    position: absolute;
    inset: 0;
    background: url('./login_bg.png') no-repeat center center fixed;
    background-size: cover;
    filter: brightness(0.6);
}
.signin-body-container {
    height: 95dvh;
    display: grid;
    place-items: center;
}

.v-card { 
    margin-top: -10%; 
}

.required label::after {
    content: '*';
}
</style>