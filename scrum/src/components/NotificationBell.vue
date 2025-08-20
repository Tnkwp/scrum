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
          v-for="item in notifications"
          :key="item.id"
          class="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer"
          @click="markAsRead(item)"
        >
          <div class="flex-1">
            <p class="text-gray-800">
              <span v-html="item.message"></span>
            </p>
            <div class="flex items-center gap-1 text-xs text-gray-500">
              <span>{{ item.time }}</span>
              <span
                v-if="item.status === 'unread'"
                class="w-2 h-2 bg-green-200 rounded-full inline-block"
              ></span>
            </div>
          </div>
        </li>
      </ul>
      <button
        class="w-full border-t h-7 flex items-center justify-center hover:bg-green-200 cursor-pointer"
        @click="allnoti"
      >
        <span>ดูข้อความทั้งหมด</span>
      </button>
    </div>

     <div class="fixed bottom-4 right-4 space-y-2 z-50">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in"
    >
      {{ t.message }}
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { io } from "socket.io-client";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const router = useRouter();
const notifications = ref([]);
const showNotification = ref(false);
const token = ref(localStorage.getItem("token"));
let timer = null;

const toggleNotification = () => {
  showNotification.value = !showNotification.value;
};

// --- Socket.IO setup ---
let socket = null;
const user = ref(null);
const toasts = ref([]);

const notify = (message) => {
  if (!("Notification" in window)) {
    addToast(message);
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(message);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") {
        new Notification(message);
      } else {
        addToast(message);
      }
    });
  } else {
    addToast(message);
  }
};

function addToast(message) {
  const id = Date.now();
  toasts.value.push({ id, message });
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, 3000); // หายไปเองหลัง 3 วินาที
}

// --- Fetch user profile ---
const fetchUserProfile = async () => {
  if (!token.value) return;
  try {
    const res = await axios.get(`${backendUrl}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    user.value = res.data.user;
  } catch (err) {
    console.error("Failed to fetch user", err);
  }
};

// --- Fetch notifications ---
const fetchNotifications = async () => {
  if (!token.value) return;
  try {
    const res = await axios.get(`${backendUrl}/api/notifications`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    const list = Array.isArray(res.data)
      ? res.data
      : res.data.notifications || res.data.data || [];

    notifications.value = list.map((item) => ({
      ...item,
      rawTime: item.created_at,
      time: formatTime(item.created_at),
    }));
  } catch (err) {
    console.error("Error fetching notifications:", err);
  }
};

// --- Mark as read ---
const markAsRead = async (item) => {
  if (item.status !== "unread") return;
  try {
    await axios.patch(
      `${backendUrl}/api/notifications/${item.id}`,
      { status: "read" },
      { headers: { Authorization: `Bearer ${token.value}` } }
    );
    item.status = "read";
  } catch (err) {
    console.error(err);
  }
};

// --- Format time ---
const formatTime = (isoDate) => {
  const date = new Date(isoDate);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return `${diff} วินาทีที่แล้ว`;
  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "เมื่อวาน";
  if (days < 7) return `${days} วันที่แล้ว`;
  return date.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
};

// --- Update times every minute ---
const updateTimes = () => {
  notifications.value = notifications.value.map((item) => ({
    ...item,
    time: formatTime(item.rawTime),
  }));
};

const unreadCount = computed(() => notifications.value.filter((n) => n.status === "unread").length);

const handleClickOutside = (e) => {
  const bell = document.querySelector("img[src='/bell.png']");
  const dropdown = document.querySelector(".absolute.right-0.mt-2.w-80");
  if (showNotification.value && !bell?.contains(e.target) && !dropdown?.contains(e.target)) {
    showNotification.value = false;
  }
};

function allnoti() {
  showNotification.value = false;
  router.push("/all-notifications");
}

onMounted(async () => {
  await fetchUserProfile();
  await fetchNotifications();

  // Connect socket if user exists
  if (user.value?.id) {
    socket = io(backendUrl, {
      autoConnect: true,
      auth: { token: `Bearer ${token.value}` },
    });

    socket.emit("join", user.value.id);

    socket.on("notification", (data) => {
      notifications.value.unshift({
        ...data,
        rawTime: data.created_at,
        time: formatTime(data.created_at),
      });
      notify(data.message);
    });

    socket.on("notification:update", fetchNotifications);
  }

  timer = setInterval(updateTimes, 60000);
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  if (timer) clearInterval(timer);
  if (socket) {
    socket.off("notification");
    socket.off("notification:update");
    socket.disconnect();
  }
});
</script>


<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fade-in 0.3s ease;
}
</style>
