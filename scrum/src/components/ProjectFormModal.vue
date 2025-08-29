<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg p-6 shadow-xl relative font-noto w-[600px]">
      <div class="space-y-4">
        <!-- Project Info -->
        <div class="grid grid-cols-3 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm">Project Title</label>
            <el-mention
              v-model="form.title"
              style="height: 30px"
              placeholder="Project Title"
            >
            </el-mention>
            <!-- <input
              v-model="form.title"
              type="text"
              placeholder="Project Title"
              class="input"
            /> -->
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm">Deadline Date</label>
            <el-date-picker
              v-model="form.deadline_date"
              type="date"
              placeholder=""
            />
            <!-- <input v-model="form.deadline_date" type="date" class="input" /> -->
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm">Daily Scrum Time</label>
            <el-time-picker
              v-model="form.scrum_time"
              arrow-control
              placeholder="time"
            />
            <!-- <input v-model="form.scrum_time" type="time" class="input" /> -->
          </div>
        </div>

        <!-- Description -->
        <div class="flex flex-col gap-2">
          <label class="text-sm">Description</label>
          <el-mention
            v-model="form.description"
            type="textarea"
            style=""
            placeholder=""
          />
          <!-- <textarea
            v-model="form.description"
            class="w-full h-24 resize-none border border-gray-300 rounded"
          /> -->
        </div>

        <div class="">
          <div class="flex items-center gap-2">
            <label class="text-sm mb-1 block">Add Member</label>
            <button
              @click="addMember"
              class="w-[35px] h-[35px] text-white text-lg flex items-center justify-center"
            >
              <img src="/more.png" alt="add" />
            </button>
          </div>
          <div>
            <div
              v-for="(input, index) in memberInputs"
              :key="index"
              class="flex items-center gap-2 mt-2"
            >
              <!-- ปุ่มเลือกรายชื่อ -->
              <div class="relative w-[200px]">
                <div
                  class="border border-gray-300 rounded px-2 py-1 text-sm flex items-center justify-between cursor-pointer"
                  @click="input.showDropdown = !input.showDropdown"
                >
                  <div v-if="input.user">
                    <img
                      :src="input.user.profile_pic || '/user.png'"
                      class="inline w-6 h-6 rounded-full"
                    />
                    {{ input.user.firstname }} {{ input.user.lastname }}
                  </div>
                  <div v-else class="text-gray-400">เลือกสมาชิก</div>
                  <span class="ml-2">&#9662;</span>
                </div>

                <div
                  v-if="input.showDropdown"
                  class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow"
                >
                  <div
                    v-for="user in users"
                    :key="user.id"
                    class="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    @click="
                      () => {
                        input.user = user;
                        input.showDropdown = false;
                      }
                    "
                  >
                    <img
                      :src="user.profile_pic || '/user.png'"
                      class="w-6 h-6 rounded-full mr-2"
                    />
                    {{ user.firstname }} {{ user.lastname }}
                  </div>
                </div>
              </div>

              <!-- เลือกตำแหน่ง -->
              <div>
                <div
                  v-if="input.position === 'Other...'"
                  class="relative w-[170px]"
                >
                  <input
                    v-model="input.customPosition"
                    type="text"
                    placeholder="Enter position"
                    class="h-[35px] w-full border border-gray-300 rounded px-3 pr-7 py-2 text-[14px]"
                  />
                  <button
                    @click="
                      () => {
                        input.position = '';
                        input.customPosition = '';
                      }
                    "
                    class="absolute right-1 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 text-sm"
                    title="ยกเลิก"
                  >
                    ✖
                  </button>
                </div>
                <select
                  v-else
                  v-model="input.position"
                  class="input h-[35px] border border-gray-300 rounded px-2 py-1 text-[14px] w-[170px]"
                >
                  <option disabled value="">Position</option>
                  <option>BA</option>
                  <option>UX/UI</option>
                  <option>Back-end</option>
                  <option>Front-end</option>
                  <option>Tester</option>
                  <option>Other...</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 mt-6">
        <button
          @click="$emit('close')"
          class="px-4 py-1 bg-[#D1FAE5] text-black rounded"
        >
          Cancel
        </button>
        <button
          @click="submitForm"
          class="px-4 py-1 bg-[#10B981] text-white rounded"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";

const token = ref(null);
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const users = ref([]);
const selectedUserId = ref("");
const form = ref({
  title: "",
  description: "",
  deadline_date: "",
  scrum_time: "",
});
const newMember = ref("");
const position = ref("");
const members = ref([]);
const customPosition = ref("");
const selectedUser = ref(null);
const showDropdown = ref(false);

const emit = defineEmits(["close", "submit"]);
const memberInputs = ref([
  { user: null, position: "", customPosition: "", showDropdown: false },
]);

function addMember() {
  memberInputs.value.push({
    user: null,
    position: "",
    customPosition: "",
    showDropdown: false,
  });
}

const submitForm = async () => {
  token.value = localStorage.getItem("token");
  if (!token.value) {
    Swal.fire("Error", "ไม่พบ token กรุณาเข้าสู่ระบบ", "error");
    return;
  }

  const membersData = memberInputs.value
    .filter((input) => input.user && (input.position || input.customPosition))
    .map((input) => ({
      user_id: input.user.id,
      position:
        input.position === "Other..." ? input.customPosition : input.position,
    }));

  const payload = {
    ...form.value,
    members: membersData,
  };

  console.log("Project Payload:", payload);

  try {
    const response = await axios.post(`${backendUrl}/api/projects`, payload, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        "ngrok-skip-browser-warning": "true",
      },
      withCredentials: true,
    });

    console.log("บันทึกเรียบร้อย:", response.data);

    Swal.fire("สำเร็จ", "สร้างโปรเจกต์เรียบร้อยแล้ว", "success");

    emit("submit", response.data);
    emit("close");

    form.value = {
      title: "",
      description: "",
      deadline_date: "",
      scrum_time: "",
    };
    memberInputs.value = [
      { user: null, position: "", customPosition: "", showDropdown: false },
    ];
  } catch (error) {
    Swal.fire(
      "เกิดข้อผิดพลาด",
      error.response?.data?.message || error.message,
      "error"
    );
  }
};

watch(position, (val) => {
  if (val !== "Other...") {
    customPosition.value = "";
  }
});

function cancelCustomPosition() {
  position.value = "";
  customPosition.value = "";
}

onMounted(async () => {
  token.value = localStorage.getItem("token");
  try {
    const res = await axios.get(`${backendUrl}/api/users/all`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        "ngrok-skip-browser-warning": "true",
      },
      withCredentials: true,
    });
    users.value = res.data.users || [];
  } catch (err) {
    console.error("ไม่สามารถโหลดรายชื่อผู้ใช้:", err);
  }
});

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

function selectUser(user) {
  selectedUserId.value = user.id;
  selectedUser.value = user;
  showDropdown.value = false;
}
</script>

<style scoped>
.input {
  @apply w-full h-[30px] border border-gray-300 rounded px-3 py-2 text-[14px];
}

::v-deep(.el-date-editor.el-input) {
  @apply w-full h-[30px] text-[14px];
}
</style>
