<template>
  <div class="min-h-screen bg-[#E8FFF1] font-noto pt-6">
    <div class="flex justify-between items-center px-4 py-6">
      <!-- ซ้ายสุด: ปุ่ม back -->
      <button @click="goBack">
        <img src="/left-arrow.png" alt="Back" class="w-6 h-6" />
      </button>

      <!-- กลาง: ช่วงวันที่ -->
      <div class="flex gap-4">
        <div>
          <label class="block text-sm">From :</label>
          <input
            type="date"
            v-model="fromDate"
            class="border px-2 py-1 rounded w-32 text-center"
          />
        </div>
        <div>
          <label class="block text-sm">To :</label>
          <input
            type="date"
            v-model="toDate"
            class="border px-2 py-1 rounded w-32 text-center"
          />
        </div>
      </div>

      <!-- ขวาสุด (ว่างไว้ถ้าไม่ต้องการอะไรที่ขวา) -->
      <div class="w-6 h-6"></div>
    </div>

    <!-- Card Grid -->
    <div class="flex justify-center">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 px-4 pb-10">
        <div
          v-for="(card, index) in scrumMembers"
          :key="index"
          class="bg-white rounded-lg shadow-md p-4 flex flex-col gap-2"
        >
          <div class="flex gap-3 items-start">
            <img
              :src="card.profile_pic || '/user.png'"
              alt="Avatar"
              class="w-10 h-10 rounded-full"
            />
            <div>
              <div class="flex items-center gap-2">
                <span class="font-medium"
                  >{{ card.firstname }} {{ card.lastname }}</span
                >
                <span
                  class="bg-gray-100 text-sm px-2 py-1 rounded shadow text-gray-700"
                >
                  {{ card.position }}
                </span>
              </div>

              <!-- Type-based content -->
              <div class="mt-2 text-sm whitespace-pre-line">
                <template v-if="card.type === 'daily'">
                  <strong>สิ่งที่ทำวันนี้</strong><br />
                  {{ card.today || "-" }}<br />
                  <strong>ปัญหาวันนี้</strong>
                  <template v-if="card.problem_level">
                    <span
                      class="inline-block w-3 h-3 rounded-full ml-2"
                      :class="{
                        'bg-green-500': card.problem_level === 'minor',
                        'bg-yellow-500': card.problem_level === 'moderate',
                        'bg-red-500': card.problem_level === 'critical',
                      }"
                    ></span>
                  </template>
                  <template v-else>
                    <span class="text-sm text-gray-500">-</span> </template
                  ><br />
                  {{ card.problem || "-" }}<br />
                  <strong>พรุ่งนี้ทำอะไร</strong><br />
                  {{ card.tomorrow || "-" }}
                </template>

                <template
                  v-else-if="
                    card.type === 'friday' || card.type === 'retrospective'
                  "
                >
                  <strong>สิ่งที่ทำวันนี้</strong><br />
                  {{ card.today || "-" }}<br />
                  <strong>Good</strong><br />
                  {{ card.good || "-" }}<br />
                  <strong>Bad</strong><br />
                  {{ card.bad || "-" }}<br />
                  <strong>Try</strong><br />
                  {{ card.try || "-" }}<br />
                  <strong>Next Sprint</strong><br />
                  {{ card.next_sprint || "-" }}
                </template>
              </div>
            </div>
          </div>
          <div class="text-right text-sm text-gray-500 mt-2">
            {{ formatDate(card.created_at) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const projectId = route.params.id;
const token = ref(null);
const scrumMembers = ref([]);
const fromDate = ref("");
const toDate = ref("");
const allScrumMembers = ref([]);
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const fetchScrumData = async () => {
  token.value = localStorage.getItem("token");
  try {
    const res = await axios.get(
      `${backendUrl}/api/daily-scrum/project/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "ngrok-skip-browser-warning": "true",
        },
        withCredentials: true,
      }
    );

    const mapped = res.data.scrums.map((scrum) => ({
      type: scrum.type,
      today: scrum.today_task,
      problem: scrum.problem,
      problem_level: scrum.problem_level,
      tomorrow: scrum.tomorrow_task,
      good: scrum.good,
      bad: scrum.bad,
      try: scrum.try,
      next_sprint: scrum.next_sprint,
      firstname: scrum.user.firstname,
      lastname: scrum.user.lastname,
      profile_pic: scrum.user.profile_pic,
      position: scrum.user.position,
      created_at: scrum.created_at,
    }));

    allScrumMembers.value = mapped;
    scrumMembers.value = mapped;
  } catch (err) {
    console.error("Error fetching scrum data:", err);
  }
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0"); 
  const month = String(date.getMonth() + 1).padStart(2, "0"); 
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const applyDateFilter = () => {
  const from = fromDate.value ? new Date(fromDate.value) : null;
  const to = toDate.value ? new Date(toDate.value) : null;

  scrumMembers.value = allScrumMembers.value.filter((scrum) => {
    const createdDate = new Date(scrum.created_at);
    return (!from || createdDate >= from) && (!to || createdDate <= to);
  });
};

watch([fromDate, toDate], () => {
  applyDateFilter();
});

onMounted(() => {
  if (projectId) {
    fetchScrumData();
  }
});

const goBack = () => {
  router.back(); 
};
</script>

<style scoped>

</style>
