import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "login",
    component: () => import("./views/Login.vue"),
  },
  {
    path: "/professor",
    name: "professor",
    component: () => import("./views/Professor.vue"),
  },
  {
    path: "/student",
    name: "student",
    component: () => import("./views/Student.vue"),
  },
  {
    path: "/admin",
    name: "admin",
    component: () => import("./views/Admin.vue"),
  },
  {
    path: "/professor/class/:classId/:className",
    name: "classDetails",
    component: () => import("./views/ClassDetail.vue"),
  },
  {
    path: "/professor/class/:classId/::className/quiz/:quizId",
    name: "quizDetails",
    component: () => import("./views/QuizDetail.vue"),
  },
  {
    path: "/quizReports/:quizId",
    name: "quizReports",
    component: () => import("./components/QuizReports.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/start-quiz/:quizId",
    name: "startQuiz",
    component: () => import("./components/StartQuizDialog.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/recipes",
    name: "recipes",
    component: () => import("./views/RecipeList.vue"),
  },
  {
    path: "/recipe/:id",
    name: "editRecipe",
    props: true,
    component: () => import("./views/EditRecipe.vue"),
  },
  {
    path: "/ingredients",
    name: "ingredients",
    component: () => import("./views/IngredientList.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("user");

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: "login" });
  } else {
    next();
  }
});

export default router;
