<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <router-view />
        <div v-if="!classesData?.length" class="text-center pa-4 text-grey">
           students haven't created yet.
        </div>
</template>
