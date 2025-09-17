<template>
  <div>
    <!-- Modal -->
    <div
      v-if="openLeaderboard"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="bg-white rounded-2xl shadow-lg p-6 w-[700px]">
        <!-- Header -->
        <div class="flex justify-between items-center border-b pb-2 mb-4">
          <h2 class="text-xl font-bold">Leaderboard</h2>
          <button @click="closeModal" class="text-gray-500 hover:text-black text-lg">
            ✕
          </button>
        </div>

        <!-- Table -->
        <table class="w-full border border-gray-300 text-center">
          <thead>
            <tr class="bg-gray-200">
              <th class="border p-2">อันดับ</th>
              <th class="border p-2">รายชื่อ</th>
              <th class="border p-2">คะแนน</th>
              <th class="border p-2">โปรเจกต์</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in leaderboard" :key="user.id">
              <td class="border p-2">{{ index + 1 }}</td>
              <td class="border p-2">{{ user.firstname }} {{ user.lastname }}</td>
              <td class="border p-2">{{ user.scrum_point }}</td>
              <td class="border p-2">{{ user.project }}</td>
            </tr>
          </tbody>
        </table>

        <!-- กรณีไม่มีข้อมูล -->
        <div v-if="leaderboard.length === 0" class="text-center text-gray-500 py-4">
          ไม่มีข้อมูล leaderboard
        </div>
      </div>
    </div>

    <!-- Floating Button -->
    <button
      @click="fetchLeaderboard"
      class="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center shadow-md hover:bg-gray-400 transition"
    >
      <img src="/graphic.png" alt="graphic" class="w-7 h-7" />
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const openLeaderboard = ref(false);
const leaderboard = ref([]);

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// 📌 ฟังก์ชันดึง leaderboard จาก API
const fetchLeaderboard = async () => {
  try {
    const res = await axios.get(`${backendUrl}/api/projects/leaderboard`);
    leaderboard.value = res.data.leaderboard || [];
    openLeaderboard.value = true;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    leaderboard.value = [];
    openLeaderboard.value = true;
  }
};

const closeModal = () => {
  openLeaderboard.value = false;
};
</script>
