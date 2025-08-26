<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
      <div class="space-y-4">
        <!-- Daily-scrum Type -->
        <div class="flex justify-between">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Daily-scrum Type ะะะ
            </label>
            <select
              v-model="formData.type"
              class="w-full border border-gray-300 rounded px-5 py-2"
            >
              <option value="daily">Daily scrum</option>
              <option value="friday">Friday Scrum</option>
              <option value="retrospective">Retrospective</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              v-model="formData.created_at"
              :min="canSubmitYesterday ? minDate : maxDate"
              :max="maxDate"
              class="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>

        <!-- Fields -->
        <div v-if="formData.type === 'daily'">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >สิ่งที่ทำวันนี้</label
          >
          <textarea
            v-model="formData.today_task"
            class="w-full border rounded px-3 py-2 h-20"
          />

          <div class="flex gap-2 items-center mb-1 mt-2">
            <label class="block text-sm font-medium text-gray-700 mb-1 mt-2"
              >ปัญหาวันนี้</label
            >
            <select
              v-model="formData.problem_level"
              class="border rounded px-2 py-2"
            >
              <option disabled value="">-- เลือกระดับความรุนแรง --</option>
              <option>minor</option>
              <option>moderate</option>
              <option>critical</option>
            </select>
          </div>

          <textarea
            v-model="formData.problem"
            class="w-full border rounded px-3 py-2 h-20"
          />
          <label class="block text-sm font-medium text-gray-700 mb-1 mt-2"
            >พรุ่งนี้ทำอะไร</label
          >
          <textarea
            v-model="formData.tomorrow_task"
            class="w-full border rounded px-3 py-2 h-20"
          />

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1 mt-2"
              >แนบไฟล์ (เช่น ภาพ, PDF ฯลฯ)</label
            >
            <input
              type="file"
              multiple
              @change="handleFileChange"
              class="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div v-else>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >สิ่งที่ทำวันนี้</label
          >
          <textarea
            v-model="formData.today_task"
            class="w-full border rounded px-3 py-2 h-20"
          />

          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Good</label
          >
          <textarea
            v-model="formData.good"
            class="w-full border rounded px-3 py-2 h-20"
          />

          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Bad</label
          >
          <textarea
            v-model="formData.bad"
            class="w-full border rounded px-3 py-2 h-20"
          />

          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Try</label
          >
          <textarea
            v-model="formData.try"
            class="w-full border rounded px-3 py-2 h-20"
          />

          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Next Sprint</label
          >
          <textarea
            v-model="formData.next_sprint"
            class="w-full border rounded px-3 py-2 h-20"
          />

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1 mt-2"
              >แนบไฟล์ (เช่น ภาพ, PDF ฯลฯ)</label
            >
            <input
              type="file"
              multiple
              @change="handleFileChange"
              class="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex justify-end gap-2">
          <button
            @click="$emit('close')"
            class="bg-[#D1FAE5] py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button @click="handleSubmit" class="bg-[#10B981] py-2 px-4 rounded">
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import Swal from "sweetalert2";

const props = defineProps({
  visible: Boolean,
  projectId: Number,
  canSubmitYesterday: Boolean,
  scrumId: Number,
});

console.log("scrumid", props);
const emit = defineEmits(["close", "submitted"]);
const token = ref(null);
const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);

const formatDateForInput = (d) => d.toISOString().split("T")[0];
const maxDate = formatDateForInput(today);
const minDate = formatDateForInput(yesterday);

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const formData = ref({
  type: "daily",
  today_task: "",
  problem: "",
  problem_level: "",
  tomorrow_task: "",
  good: "",
  bad: "",
  try: "",
  next_sprint: "",
  project_id: props.projectId,
  created_at: formatDateForInput(today),
  files: [],
});

const oldFiles = ref([]); // สำหรับเก็บไฟล์เดิม

const handleFileChange = (e) => {
  formData.value.files = Array.from(e.target.files);
};

onMounted(() => {
  if (props.visible && props.scrumId) {
    fetchScrumDetail(props.scrumId);
  }
});

watch(
  () => [props.scrumId, props.visible],
  async ([newId, isVisible]) => {
    console.log("Watcher fired:", newId, isVisible);
    if (newId && isVisible) {
      await fetchScrumDetail(newId);
    }
  }
);

const fetchScrumDetail = async (id) => {
  token.value = localStorage.getItem("token");
  try {
    const res = await axios.get(
      `${backendUrl}/api/daily-scrum/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "ngrok-skip-browser-warning": "true",
        },
        withCredentials: true,
      }
    );

    const data = res.data.scrum;
    console.log("API Response:", res.data);
    formData.value.type = data.type || "daily";
    formData.value.today_task = data.today_task || "";
    formData.value.problem = data.problem || "";
    formData.value.problem_level = data.problem_level || "";
    formData.value.tomorrow_task = data.tomorrow_task || "";
    formData.value.good = data.good || "";
    formData.value.bad = data.bad || "";
    formData.value.try = data.try || "";
    formData.value.next_sprint = data.next_sprint || "";
    formData.value.created_at = data.created_at
      ? new Date(data.created_at).toISOString().split("T")[0]
      : formatDateForInput(today);
    formData.value.files = [];

    // แปลงไฟล์เดิมมาเก็บใน oldFiles
    oldFiles.value = (data.files || []).map((f) => ({
      id: f.id,
      url: f.url || f.path,
      name: f.name || f.filename || `ไฟล์ ${f.id}`,
    }));
  } catch (error) {
    console.error("Error loading scrum detail:", error);
    Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ" });
  }
};

const handleSubmit = async () => {
  token.value = localStorage.getItem("token");
  try {
    const data = new FormData();

    for (const key in formData.value) {
      if (key !== "files") {
        const value = formData.value[key];
        if (value !== undefined && value !== null && value !== "") {
          data.append(key, value);
        }
      }
    }

    if (formData.value.files.length > 0) {
      formData.value.files.forEach((file) => {
        data.append("files", file);
      });
    }

    await axios.patch(`${backendUrl}/api/daily-scrum/${props.scrumId}`, data, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        "ngrok-skip-browser-warning": "true",
      },
      withCredentials: true,
    });

    Swal.fire({ icon: "success", title: "อัปเดตสำเร็จ", timer: 1500 });
    emit("submitted");
    emit("close");
  } catch (error) {
    console.error("Error updating daily scrum:", error);
    Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" });
  }
};
</script>
