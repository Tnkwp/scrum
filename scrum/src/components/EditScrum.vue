<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
  >
    <div
      class="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 p-6 space-y-6 relative"
    >
      <div class="flex justify-between items-center border-b pb-4">
        <h2 class="text-xl font-semibold text-gray-800">
          {{ formData.type === "daily" ? "Daily Post" : "Weekly Post" }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700 transition"
        >
          ✕
        </button>
      </div>
      <div class="space-y-4">
        <!-- Daily-scrum Type -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Post type
            </label>
            <el-select
              v-model="formData.type"
              placeholder="Select type"
              class="w-full"
            >
              <el-option label="Daily Post" value="daily" />
              <el-option label="Weekly Post" value="weekly" />
            </el-select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <el-date-picker
              v-model="formData.created_at"
              type="date"
              placeholder="เลือกวันที่"
              :picker-options="datePickerOptions"
              class="w-full"
            />
          </div>
        </div>

        <!-- Fields -->
        <div
          v-if="formData.type === 'daily'"
          class="max-h-[60vh] overflow-y-auto pr-2 space-y-3"
        >
          <label class="block font-medium text-gray-700 mb-1"
            >สิ่งที่ทำวันนี้</label
          >
          <textarea
            v-model="formData.today_task"
            class="w-full border rounded px-3 py-2 h-20 text-sm"
          />

          <div class="flex gap-2 items-center mb-1 mt-2">
            <label class="block font-medium text-gray-700 mb-1 mt-2">
              ปัญหาวันนี้
            </label>
          </div>

          <textarea
            v-model="formData.problem"
            class="w-full border rounded px-3 py-2 h-20 text-sm"
          />

          <label class="block font-medium text-gray-700 mb-1 mt-2"
            >พรุ่งนี้ทำอะไร</label
          >
          <textarea
            v-model="formData.tomorrow_task"
            class="w-full border rounded px-3 py-2 h-20 text-sm"
          />

          <div>
            <label class="block font-medium text-gray-700 mb-1 mt-2">
              แนบไฟล์ (เช่น ภาพ, PDF ฯลฯ)
            </label>
            <el-upload
              v-model:file-list="fileList"
              action=""
              multiple
              :auto-upload="false"
              :on-change="handleChange"
              :on-remove="handleRemove"
              :on-preview="handlePreview"
              list-type="text"
              class="w-full flex flex-col"
              style="width: 100%"
            >
              <el-button
                type="primary"
                class="w-full !justify-center"
                style="width: 100%"
              >
                Click to upload
              </el-button>
            </el-upload>

            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >ไฟล์ที่แนบ</label
              >
              <div
                v-if="formData.files && formData.files.length"
                class="flex flex-wrap gap-4"
              >
                <div
                  v-for="file in formData.files"
                  :key="file.id"
                  class="relative w-32 h-32 border rounded-lg overflow-hidden group"
                >
                  <img
                    v-if="file.mime_type && file.mime_type.startsWith('image/')"
                    :src="file.file_url"
                    :alt="file.file_name"
                    class="w-full h-full object-cover"
                  />
                  <a
                    v-else
                    :href="file.file_url"
                    target="_blank"
                    class="flex items-center justify-center h-full text-blue-600 underline text-sm text-center p-2"
                  >
                    {{ file.file_name }}
                  </a>
                  <button
                    @click="deleteSingleFile(file)"
                    class="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                  >
                    ลบ
                  </button>
                </div>
              </div>
              <p v-else class="text-gray-500 text-sm">ไม่มีไฟล์แนบ</p>
            </div>
          </div>
        </div>

        <div v-else class="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            สิ่งที่ทำวันนี้
          </label>
          <textarea
            v-model="formData.today_task"
            class="w-full border rounded px-3 py-2 h-20"
          />

          <label class="block text-sm font-medium text-gray-700 mb-1">
            Good
          </label>
          <textarea
            v-model="formData.good"
            class="w-full border rounded px-3 py-2 h-20"
          />

          <label class="block text-sm font-medium text-gray-700 mb-1">
            Bad
          </label>
          <textarea
            v-model="formData.bad"
            class="w-full border rounded px-3 py-2 h-20"
          />

          <label class="block text-sm font-medium text-gray-700 mb-1">
            Try
          </label>
          <textarea
            v-model="formData.try"
            class="w-full border rounded px-3 py-2 h-20"
          />

          <label class="block text-sm font-medium text-gray-700 mb-1">
            Next Sprint
          </label>
          <textarea
            v-model="formData.next_sprint"
            class="w-full border rounded px-3 py-2 h-20"
          />

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1 mt-2">
              แนบไฟล์ (เช่น ภาพ, PDF ฯลฯ)
            </label>
            <el-upload
              v-model:file-list="fileList"
              action=""
              multiple
              :auto-upload="false"
              :on-change="handleChange"
              :on-remove="handleRemove"
              :on-preview="handlePreview"
              list-type="text"
              class="w-full flex flex-col"
              style="width: 100%"
            >
              <el-button
                type="primary"
                class="w-full !justify-center"
                style="width: 100%"
              >
                Click to upload
              </el-button>
            </el-upload>

            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                ไฟล์ที่แนบ
              </label>
              <div
                v-if="formData.files && formData.files.length"
                class="flex flex-wrap gap-4"
              >
                <div
                  v-for="file in formData.files"
                  :key="file.id"
                  class="relative w-32 h-32 border rounded-lg overflow-hidden group"
                >
                  <!-- ถ้าเป็นรูปภาพ -->
                  <img
                    v-if="file.mime_type && file.mime_type.startsWith('image/')"
                    :src="file.file_url"
                    :alt="file.file_name"
                    class="w-full h-full object-cover"
                  />
                  <!-- ถ้าเป็น PDF หรือไฟล์อื่น -->
                  <a
                    v-else
                    :href="file.file_url"
                    target="_blank"
                    class="flex items-center justify-center h-full text-blue-600 underline text-sm text-center p-2"
                  >
                    {{ file.file_name }}
                  </a>

                  <!-- ปุ่มลบ -->
                  <button
                    @click="deleteSingleFile(file)"
                    class="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                  >
                    ลบ
                  </button>
                </div>
              </div>
              <p v-else class="text-gray-500 text-sm">ไม่มีไฟล์แนบ</p>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex justify-end gap-2 border-t w-full pt-3">
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
import { ref, onMounted, watch, computed } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { ElMessage, ElMessageBox } from "element-plus";

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
// const maxDate = formatDateForInput(today);
// const minDate = formatDateForInput(yesterday);

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
const fileList = ref([]);

const datePickerOptions = computed(() => ({
  disabledDate: (time) => {
    const todayTime = today.getTime();
    const yesterdayTime = yesterday.getTime();
    if (props.canSubmitYesterday) {
      return time.getTime() < yesterdayTime || time.getTime() > todayTime;
    } else {
      return time.getTime() < todayTime || time.getTime() > todayTime;
    }
  },
}));

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
    const res = await axios.get(`${backendUrl}/api/posts/${id}`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        "ngrok-skip-browser-warning": "true",
      },
      withCredentials: true,
    });

    const data = res.data.post;
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
    formData.value.files = data.files || [];
  } catch (error) {
    console.error("Error loading scrum detail:", error);
    Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ" });
  }
};

const handleRemove = (file, uploadFiles) => {
  console.log("Removed file:", file);
};

const deleteSingleFile = async (file) => {
  try {
    if (!props.scrumId) {
      Swal.fire({ icon: "warning", title: "ไม่พบ scrumId" });
      return;
    }
    await axios.delete(`${backendUrl}/api/posts/${props.scrumId}/file`, {
      data: { fileName: file.file_name },
      headers: { Authorization: `Bearer ${token.value}` },
    });

    formData.value.files = formData.value.files.filter((f) => f.id !== file.id);
    Swal.fire({ icon: "success", title: "ลบไฟล์สำเร็จ" });
  } catch (error) {
    console.error("Error deleting file:", error);
    Swal.fire({ icon: "error", title: "ลบไฟล์ไม่สำเร็จ" });
  }
};

const handlePreview = (file) => {
  if (file.url) {
    window.open(file.url);
  } else if (file.raw) {
    const reader = new FileReader();
    reader.onload = (e) => window.open(e.target.result);
    reader.readAsDataURL(file.raw);
  }
};

const handleSubmit = async () => {
  token.value = localStorage.getItem("token");
  try {
    const data = new FormData();

    for (const key in formData.value) {
      if (key !== "files") data.append(key, formData.value[key]);
    }

    fileList.value.forEach((file) => {
      data.append("files", file.raw);
    });

    await axios.put(`${backendUrl}/api/posts/${props.scrumId}`, data, {
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
