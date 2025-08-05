<template>
  <div class="relative">
    <!-- Bell Icon -->
    <button @click="toggleNotification" class="flex items-center">
      <img src="/bell.png" alt="Notifications" class="w-[20px]" />
    </button>

    <!-- Notification Dropdown -->
    <div
      v-if="showNotification"
      class="absolute right-0 mt-2 w-80 bg-white shadow-md rounded-lg text-sm z-30"
    >
      <div class="p-2 border-b font-bold text-gray-700">แจ้งเตือน</div>
      <ul class="max-h-64 overflow-y-auto divide-y divide-gray-200">
        <li
          v-for="(item, index) in notifications"
          :key="index"
          class="p-3 hover:bg-gray-50"
        >
          <p class="font-medium text-gray-800" v-html="item.message"></p>
          <p class="text-xs text-gray-500">{{ item.time }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

// Dummy notification data (replace with props or API later)
const notifications = ref([
  {
    message: "Firstname Lastname comments on your post",
    time: "5m ago",
  },
  {
    message: "Firstname Lastname comments on your post",
    time: "10m ago",
  },
  {
    message:
      `You didn’t post daily-scrum today. <a href='#' class='text-blue-600 underline'>Click here to post daily-scrum</a>`,
    time: "Today 6:00 PM",
  },
]);

const showNotification = ref(false);

const toggleNotification = () => {
  showNotification.value = !showNotification.value;
};

const handleClickOutside = (e) => {
  const bell = document.querySelector("img[src='/bell.png']");
  const dropdown = document.querySelector(".absolute.right-0.mt-2.w-80");
  if (
    showNotification.value &&
    !bell?.contains(e.target) &&
    !dropdown?.contains(e.target)
  ) {
    showNotification.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>