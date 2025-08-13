<template>
  <div class="relative">
    <!-- Bell Icon -->
    <button @click="toggleNotification" class="flex items-center relative">
      <img src="/bell.png" alt="Notifications" class="w-[20px]" />
      <!-- Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full"
      >
        {{ unreadCount }}
      </span>
    </button>

    <!-- Notification Dropdown -->
    <div
      v-if="showNotification"
      class="absolute right-0 mt-2 w-80 bg-white shadow-md rounded-lg text-sm z-30"
    >
      <div class="p-2 border-b font-bold text-gray-700 text-center">
        แจ้งเตือน
      </div>
      <ul class="max-h-64 overflow-y-auto divide-y divide-gray-200">
        <li
          v-for="(item, index) in notifications"
          :key="index"
          class="flex items-start gap-3 p-3 hover:bg-gray-50"
        >
          <!-- Avatar -->
          <!-- <div class="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div> -->

          <!-- Message -->
          <div class="flex-1">
            <p class="text-gray-800">
              <!-- <span class="font-bold" v-html="item.userName"></span> -->
              <span v-html="item.message"></span>
            </p>
            <div class="flex items-center gap-1 text-xs text-gray-500">
              <span>{{ item.time }}</span>
              <span
                v-if="item.status === 'unread'"
                class="w-2 h-2 bg-black rounded-full inline-block"
              ></span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const notifications = ref([]);
const showNotification = ref(false);
const token = ref(null);
let timer = null;

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

const fetchNotifications = async () => {
  token.value = localStorage.getItem("token");
  if (!token.value) return;

  try {
    const res = await axios.get(`${backendUrl}/api/notifications`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        "ngrok-skip-browser-warning": "true",
      },
      withCredentials: true,
    });

    const list = Array.isArray(res.data)
      ? res.data
      : res.data.notifications || res.data.data || [];

    notifications.value = list.map((item) => ({
      ...item,
      rawTime: item.created_at,
      time: formatTime(item.created_at),
      // userName: item.user_name || "Firstname Lastname", // แก้ให้ดึงจาก backend
    }));
  } catch (err) {
    console.error("Error fetching notifications:", err);
  }
};

// ฟังก์ชันแปลงเวลาเป็น relative time
const formatTime = (isoDate) => {
  const date = new Date(isoDate);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} วินาทีที่แล้ว`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} นาทีที่แล้ว`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ชั่วโมงที่แล้ว`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "เมื่อวาน";
  }
  if (diffInDays < 7) {
    return `${diffInDays} วันที่แล้ว`;
  }

  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// อัพเดทเวลาทุก 1 นาที โดยไม่ยิง API
const updateTimes = () => {
  notifications.value = notifications.value.map((item) => ({
    ...item,
    time: formatTime(item.rawTime),
  }));
};

const unreadCount = computed(
  () => notifications.value.filter((n) => n.status === "unread").length
);

onMounted(() => {
  fetchNotifications();
  timer = setInterval(() => {
    fetchNotifications();
    updateTimes();
  }, 60000);
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  if (timer) clearInterval(timer);
});
</script>