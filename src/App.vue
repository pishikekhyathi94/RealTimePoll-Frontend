<script setup>
import MenuBar from "./components/MenuBar.vue";
</script>

<template>
  <v-app :style="{ background: '#F4F4F4' }">
    <MenuBar :key="$route.fullPath" />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style>
.required-field label.v-label.v-field-label::after {
    content: ' *';
}
</style>
