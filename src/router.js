import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
      path: "/professor/class/:classId",
      name: "classDetails",
      component: () => import("./views/ClassDetail.vue"),
    },
    {
      path: "/professor/class/:classId/quiz/:quizId",
      name: "quizDetails",
      component: () => import("./views/QuizDetail.vue"),
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
  ],
});

export default router;
