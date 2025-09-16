<template>
  <div class="fixed w-full z-20">
    <nav class="px-4 h-[60px] w-full shadow-md bg-[#059669] font-noto flex justify-between items-center">
      <!-- Left: Logo + Title -->
      <div class="flex items-center gap-3">
        <img src="/logo.png" alt="" class="w-8 h-8 rounded-full object-cover" />
        <span class="font-bold text-white text-lg">Daily Log</span>
      </div>

      <!-- Right: Notification + Avatar -->
      <div class="relative flex items-center gap-3">
        <button>
          <NotificationBell />
        </button>

        <button
          v-if="user"
          @click="toggleMenu"
          class="bg-gray-200 rounded-full flex items-center justify-center w-8 h-8"
        >
          <img
            :src="user?.profile_pic || '/user.png'"
            referrerpolicy="no-referrer"
            alt="profile"
            class="w-7 h-7 rounded-full "
          />
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="showMenu"
          class="absolute right-0 top-full mt-2 bg-white shadow-lg rounded z-10 min-w-[180px] px-2 py-2"
        >
          <div class="flex justify-center gap-2 border-b py-2">
            <span class="font-semibold">{{ user.firstname }}</span>
            <span class="font-semibold">{{ user.lastname }}</span>
          </div>

          <router-link
            to="/editprofile"
            @click="showMenu = false"
            class="block w-full text-left py-2 hover:bg-gray-100 border-b whitespace-nowrap"
          >
            Edit Profile
          </router-link>

          <button
            @click="handleLogout"
            class="block w-full text-left py-2 hover:bg-gray-100 whitespace-nowrap"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  </div>
</template>


<script setup>
import { onMounted, ref, onBeforeUnmount } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import NotificationBell from "./NotificationBell.vue";
import { useUserStore } from "../stores/userStore.js";

const user = ref(null);
const showMenu = ref(false);
const token = ref(null);
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const closeMenuOnClickOutside = (event) => {
  // Click outside menu closes it
  const button = document.querySelector("button.bg-gray-200");
  const menu = document.querySelector(".absolute.right-0.top-10");
  if (
    showMenu.value &&
    !button?.contains(event.target) &&
    !menu?.contains(event.target)
  ) {
    showMenu.value = false;
  }
};

onMounted(async () => {
  document.addEventListener("click", closeMenuOnClickOutside);

  const urlToken = route.query.token;

  if (urlToken) {
    userStore.setToken(urlToken);
    localStorage.setItem("token", urlToken);
  } else {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      userStore.setToken(storedToken);
    }
  }

  if (!userStore.token) {
    console.error("No token found. Please log in.");
    return;
  }

  try {
    const response = await axios.get(`${BACKEND_URL}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${userStore.token}`,
        "ngrok-skip-browser-warning": "true",
      },
      withCredentials: true,
    });

    userStore.setUser(response.data.user);
    user.value = response.data.user;
    console.log(userStore.user.id);
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      userStore.clearAuth();
      localStorage.removeItem("token");
      router.push("/");
    }
    console.error("Error details:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeMenuOnClickOutside);
});

const toggleMenu = (event) => {
  showMenu.value = !showMenu.value;
};

function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  router.push("/");
}
</script>
