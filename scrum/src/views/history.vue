<template>
  <div
    class="min-h-screen bg-gradient-to-br from-[#E8FFF1] to-[#CFF5E7] font-noto pt-28"
  >
    <!-- Header -->
    <div
      class="flex justify-between items-center px-6 pt-[60px] pb-2 fixed w-full top-0 z-10 bg-[#E8FFF1]"
    >
      <!-- Back -->
      <div class="flex">
        <button @click="goBack" class="hover:scale-110 transition">
          <img src="/left-arrow.png" alt="Back" class="w-6 h-6" />
        </button>
        <div>scrum history</div>
      </div>

      <!-- Date filter -->
      <div class="flex gap-6 items-end">
        <div>
          <label class="block text-xs text-gray-600 mb-1">From</label>
          <!-- <input
            type="date"
            v-model="fromDate"
            class="border border-gray-300 rounded-lg px-3 py-1.5 w-36 text-sm shadow-sm focus:ring-2 focus:ring-green-400"
          /> -->
          <el-date-picker v-model="fromDate" type="date" placeholder="" />
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1">To</label>
          <!-- <input
            type="date"
            v-model="toDate"
            class="border border-gray-300 rounded-lg px-3 py-1.5 w-36 text-sm shadow-sm focus:ring-2 focus:ring-green-400"
          /> -->
          <el-date-picker v-model="toDate" type="date" placeholder="" />
        </div>
      </div>

      <!-- Empty Right -->
      <div class="flex gap-4 w-[300px]">
        <!-- Member Dropdown -->
        <div class="flex-1">
          <label class="text-xs text-gray-600 mb-1">Sort by Member</label>
          <el-select
            v-model="selectedMember"
            placeholder="Select Member"
            clearable
            @change="applyFilters"
          >
            <el-option
              v-for="member in memberOptions"
              :key="member"
              :label="member"
              :value="member"
            />
          </el-select>
        </div>

        <!-- Sort Dropdown -->
        <div class="flex-1">
          <label class="text-xs text-gray-600 mb-1">Sort by</label>
          <el-select v-model="sortOption" placeholder="Select" class="w-full">
            <el-option label="Default" value=""></el-option>
            <el-option label="Name A-Z" value="name-asc"></el-option>
            <el-option label="Name Z-A" value="name-desc"></el-option>
            <el-option label="Date ↑" value="date-asc"></el-option>
            <el-option label="Date ↓" value="date-desc"></el-option>
          </el-select>
        </div>
      </div>
    </div>

    <!-- Card Grid -->
    <div class="flex justify-center">
  <div
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 w-full max-w-6xl"
  >
    <div
      v-for="(card, index) in paginatedScrumMembers"
      :key="index"
      class="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-3 hover:shadow-xl transition relative"
      :class="{
        'border-t-4 border-[#F5D2D2]': card.type === 'daily',
        'border-t-4 border-[#F8F7BA]': card.type === 'weekly',
      }"
    >
      <!-- Header: Daily / Weekly -->
      <div>
        <div v-if="card.type === 'daily'" class="border-b pb-2">
          <span class="border-green-500 font-medium px-2 py-0.5 w-full">
            Daily
          </span>
        </div>

        <div v-else-if="card.type === 'weekly'" class="border-b pb-2">
          <span class="border-green-700 font-medium px-2 py-0.5">
            Weekly
          </span>
        </div>
      </div>

      <!-- Profile (Image + Name + Position) -->
      <div class="flex gap-4 items-center">
        <img
          :src="card.profile_pic || '/user.png'"
          alt="Avatar"
          class="w-12 h-12 rounded-full object-cover shadow"
        />
        <div class="flex-1">
          <span class="font-semibold text-gray-800 block">
            {{ card.firstname }} {{ card.lastname }}
          </span>
          <span
            class="border border-green-200 text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block"
          >
            {{ card.position }}
          </span>
        </div>
      </div>

      <!-- Content: NOW BELOW PROFILE -->
      <div class="mt-3 text-sm leading-relaxed text-gray-700 space-y-2">
        <template v-if="card.type === 'daily'">
          <p>
            <strong class="text-gray-900">สิ่งที่ทำวันนี้:</strong><br />
            {{ card.today || "-" }}
          </p>
          <p>
            <strong class="text-gray-900">ปัญหาวันนี้:</strong><br />
            {{ card.problem || "-" }}
          </p>
          <p>
            <strong class="text-gray-900">พรุ่งนี้ทำอะไร:</strong><br />
            {{ card.tomorrow || "-" }}
          </p>
        </template>

        <template v-else-if="card.type === 'weekly'">
          <p><strong>สิ่งที่ทำวันนี้:</strong><br />{{ card.today || "-" }}</p>
          <p><strong>Good:</strong><br />{{ card.good || "-" }}</p>
          <p><strong>Bad:</strong><br />{{ card.bad || "-" }}</p>
          <p><strong>Try:</strong><br />{{ card.try || "-" }}</p>
          <p>
            <strong>Next Sprint:</strong><br />{{ card.next_sprint || "-" }}
          </p>
        </template>
      </div>

      <!-- Footer -->
      <div class="text-right text-xs text-gray-500 border-t pt-2 mt-auto">
        {{ formatDate(card.created_at) }}
      </div>
    </div>
  </div>
</div>

    <div class="flex justify-center pb-6">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        size="small"
        background
        layout="prev, pager, next"
        :total="scrumMembers.length"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
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
const sortOption = ref("");
const currentPage = ref(1);
const pageSize = ref(6);
const selectedMember = ref("");

const memberOptions = computed(() => {
  const names = allScrumMembers.value.map(
    (m) => `${m.firstname} ${m.lastname}`
  );
  return [...new Set(names)]; // เอาชื่อซ้ำออก
});

// ฟังก์ชันรวมการกรอง
const applyFilters = () => {
  let filtered = allScrumMembers.value;

  // กรองตามวันที่
  const from = fromDate.value ? new Date(fromDate.value) : null;
  let to = toDate.value ? new Date(toDate.value) : null;
  if (to) to.setHours(23, 59, 59, 999);

  filtered = filtered.filter((post) => {
    const createdDate = new Date(post.created_at);
    return (!from || createdDate >= from) && (!to || createdDate <= to);
  });

  // กรองตามชื่อ
  if (selectedMember.value) {
    filtered = filtered.filter(
      (post) => `${post.firstname} ${post.lastname}` === selectedMember.value
    );
  }

  scrumMembers.value = filtered;
};

// watch สำหรับวันที่
watch([fromDate, toDate], applyFilters);

const sortedScrumMembers = computed(() => {
  let temp = [...scrumMembers.value];

  switch (sortOption.value) {
    case "name-asc":
      temp.sort((a, b) => a.firstname.localeCompare(b.firstname));
      break;
    case "name-desc":
      temp.sort((a, b) => b.firstname.localeCompare(a.firstname));
      break;
    case "date-asc":
      temp.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      break;
    case "date-desc":
      temp.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
  }

  return temp;
});

const paginatedScrumMembers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return sortedScrumMembers.value.slice(start, end);
});

const fetchScrumData = async () => {
  token.value = localStorage.getItem("token");
  try {
    const res = await axios.get(
      `${backendUrl}/api/posts/project/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "ngrok-skip-browser-warning": "true",
        },
        withCredentials: true,
      }
    );

    const mapped = res.data.posts.map((post) => ({
      type: post.type,
      today: post.today_task,
      problem: post.problem,
      problem_level: post.problem_level,
      tomorrow: post.tomorrow_task,
      good: post.good,
      bad: post.bad,
      try: post.try,
      next_sprint: post.next_sprint,
      firstname: post.user.firstname,
      lastname: post.user.lastname,
      profile_pic: post.user.profile_pic,
      position: post.user.position,
      created_at: post.created_at,
    }));

    const sorted = mapped.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
      // (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    allScrumMembers.value = sorted;
    scrumMembers.value = sorted;
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
  let to = toDate.value ? new Date(toDate.value) : null;

  // ถ้ามี toDate ให้ set เวลาเป็น 23:59:59 ของวันนั้น
  if (to) {
    to.setHours(23, 59, 59, 999);
  }

  scrumMembers.value = allScrumMembers.value.filter((post) => {
    const createdDate = new Date(post.created_at);
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
:deep(.el-date-editor.el-input) {
  width: 9rem; /* w-36 */
  height: 30px;
  font-size: 14px;
}
</style>
