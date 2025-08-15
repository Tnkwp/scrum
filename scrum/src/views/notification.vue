<template>
  <div class="bg-[#F0FDF4] min-h-screen">
    <div class="flex justify-center">
      <span class="text-[16px] md:text-[22px] font-noto mt-[60px]">
        การแจ้งเตือน
      </span>
    </div>

    <div
      class="mt-10 px-4 sm:px-10 lg:px-32 xl:px-60 pt-5 mx-auto max-w-5xl bg-[#F3F4F6] rounded-t-[26px] shadow-lg"
    >
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
          <div class="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span>{{ item.time }}</span>
            <span
              v-if="item.status === 'unread'"
              class="w-2 h-2 bg-green-200 rounded-full inline-block"
            ></span>
          </div>
        </div>

        <!-- ปุ่มลบ -->
        <button
          @click="deleteNotification(item.id)"
          class="ml-2 p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors duration-200"
          title="ลบข้อความ"
        >
          <!-- ใช้ icon แทนข้อความ -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </li>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const notifications = ref([]);
const showNotification = ref(false);
const router = useRouter();
const token = ref(null);
let timer = null;

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
    }));
  } catch (err) {
    console.error("Error fetching notifications:", err);
  }
};


const markAsRead = async (item) => {
  if (item.status !== "unread") return; 

  try {
    await axios.patch(
      `${backendUrl}/api/notifications/${item.id}`,
      { status: "read" },
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "ngrok-skip-browser-warning": "true",
        },
        withCredentials: true,
      }
    );
    // อัพเดทใน frontend ด้วย
    item.status = "read";
    router.push(`/member/${item.daily_scrum_id}`)
  } catch (err) {
    console.error("Error marking notification as read:", err);
  }
};

const deleteNotification = async (id) => {
  // Confirm dialog ก่อนลบ
  const result = await Swal.fire({
    title: "คุณแน่ใจหรือไม่?",
    text: "คุณต้องการลบ notification นี้หรือไม่?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "ใช่ ลบเลย",
    cancelButtonText: "ยกเลิก",
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`${backendUrl}/api/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      // ลบออกจาก list
      notifications.value = notifications.value.filter(n => n.id !== id);

      // แสดง success alert
      Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ",
        showConfirmButton: false,
        timer: 1200,
      });
    } catch (err) {
      console.error("Error deleting notification:", err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถลบ notification ได้",
      });
    }
  }
};

const formatTime = (isoDate) => {
  const date = new Date(isoDate);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} วินาทีที่แล้ว`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "เมื่อวาน";
  if (diffInDays < 7) return `${diffInDays} วันที่แล้ว`;

  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

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
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>
