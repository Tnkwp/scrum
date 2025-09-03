<template>
  <div class="min-h-screen bg-gradient-to-br from-[#E8FFF1] to-[#CFF5E7] font-noto pt-6">
    <!-- Header -->
    <div class="flex justify-between items-center px-6 py-4  sticky top-0 z-10 bg-[#E8FFF1]">
      <!-- Back -->
      <button @click="goBack" class="hover:scale-110 transition">
        <img src="/left-arrow.png" alt="Back" class="w-6 h-6" />
      </button>

      <!-- Date filter -->
      <div class="flex gap-6 items-end">
        <div>
          <label class="block text-xs text-gray-600 mb-1">From</label>
          <input
            type="date"
            v-model="fromDate"
            class="border border-gray-300 rounded-lg px-3 py-1.5 w-36 text-sm shadow-sm focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1">To</label>
          <input
            type="date"
            v-model="toDate"
            class="border border-gray-300 rounded-lg px-3 py-1.5 w-36 text-sm shadow-sm focus:ring-2 focus:ring-green-400"
          />
        </div>
      </div>

      <!-- Empty Right -->
      <div class="w-6 h-6"></div>
    </div>

    <!-- Card Grid -->
    <div class="flex justify-center">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 w-full max-w-6xl">
        <div
          v-for="(card, index) in scrumMembers"
          :key="index"
          class="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-3 hover:shadow-xl transition"
        >
          <!-- Profile -->
          <div class="flex gap-4 items-start">
            <img
              :src="card.profile_pic || '/user.png'"
              alt="Avatar"
              class="w-12 h-12 rounded-full object-cover shadow"
            />
            <div class="flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold text-gray-800 text-base">
                  {{ card.firstname }} {{ card.lastname }}
                </span>
                <span
                  class=" border border-green-200 text-xs px-2 py-0.5 rounded-full  font-medium"
                >
                  {{ card.position }}
                </span>
              </div>

              <!-- Content -->
              <div class="mt-3 text-sm leading-relaxed text-gray-700 space-y-2">
                <template v-if="card.type === 'daily'">
                  <p><strong class="text-gray-900">สิ่งที่ทำวันนี้:</strong><br />{{ card.today || "-" }}</p>
                  <p>
                    <strong class="text-gray-900">ปัญหาวันนี้:</strong>
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
                    <br />{{ card.problem || "-" }}
                  </p>
                  <p><strong class="text-gray-900">พรุ่งนี้ทำอะไร:</strong><br />{{ card.tomorrow || "-" }}</p>
                </template>

                <template v-else-if="card.type === 'friday' || card.type === 'retrospective'">
                  <p><strong class="">สิ่งที่ทำวันนี้:</strong><br />{{ card.today || "-" }}</p>
                  <p><strong class="">Good:</strong><br />{{ card.good || "-" }}</p>
                  <p><strong class="">Bad:</strong><br />{{ card.bad || "-" }}</p>
                  <p><strong class="">Try:</strong><br />{{ card.try || "-" }}</p>
                  <p><strong class="">Next Sprint:</strong><br />{{ card.next_sprint || "-" }}</p>
                </template>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="text-right text-xs text-gray-500 mt-2 border-t pt-2">
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
