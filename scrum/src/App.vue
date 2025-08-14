<template>
  <div>
    <div v-if="!isLogin"><Nav /></div>
    <router-view />
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Nav from "./components/nav.vue";

const route = useRoute();
const isLogin = computed(() => 
  route.name === "Login" || route.path === "/"
  || route.name === "Register" || route.path === "/forgot-password"
);
</script>
<style scoped>

</style>