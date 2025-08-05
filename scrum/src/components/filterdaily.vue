<template>
  <div>
    <div class="col-start-2 justify-center items-center space-x-2 mb-5">
      <select
        v-model="selectedTopic"
        class="border px-4 py-2 rounded w-[150px]"
      >
        <option v-for="topic in topics" :key="topic._id" :value="topic">
          {{ topic.title_name }}
        </option>
      </select>
      <button @click="showModal = true" class="bg-gray-200 px-2 rounded-full">
        +
      </button>
    </div>
    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
      <div class="bg-white p-6 rounded shadow-md w-96">
        <h2 class="text-xl font-semibold text-center mb-4">สร้างหัวข้อใหม่</h2>

        <label class="block mb-2">ชื่อหัวข้อ</label>
        <input
          type="text"
          v-model="title_name"
          class="text-gray-400 w-full border px-3 py-2 rounded mb-4"
          placeholder="เช่น หัวข้อ daily-scrum"
        />

        <div class="flex justify-end space-x-4">
          <button @click="cancelModal" class="bg-gray-300 px-4 py-1 rounded">
            ยกเลิก
          </button>
          <button
            @click="addTopic"
            class="bg-blue-500 text-white px-4 py-1 rounded"
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";


const showModal = ref(false);
const title_name = ref("");
const selectedTopic = ref(null);
const topics = ref([]);

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

async function addTopic() {
  if (title_name.value.trim() !== "") {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${backendUrl}/api/title`,
        { title_name: title_name.value },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          withCredentials: true,
        }
      );
      title_name.value = "";
      await fetchTopics();
      showModal.value = false;
    } catch (error) {
      console.error("Error adding topic:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Status code:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
    }
  }
}

async function fetchTopics() {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${backendUrl}/api/title`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      withCredentials: true,
    });
    topics.value = response.data.titles;
    if (topics.value.length > 0) {
      selectedTopic.value = topics.value[0];
    }
  } catch (error) {
    console.error("Error fetching topics:", error);
  }
}

onMounted(() => {
  fetchTopics();
});

function cancelModal() {
  showModal.value = false;
  title_name.value = "";
}
</script>


