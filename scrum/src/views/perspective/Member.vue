<template>
  <div class="min-h-screen bg-[#F0FDF4] font-noto pt-8">
    <div class="p-6">
      <div class="flex justify-between items-center text-black">
        <div v-if="project">
          <h1 class="text-lg font-medium">
            <div class="flex gap-2">
              <router-link to="/homepage">
                <img src="/left-arrow.png" alt="" />
              </router-link>
              <span>Project's Title:</span
              ><span class="font-semibold">{{ project.title }}</span>
            </div>
          </h1>
        </div>
        <p>DATE : {{ getTodayDate() }}</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div class="lg:col-span-2 space-y-4">
          <div
            v-for="(member, index) in scrumMemberss"
            :key="index"
            class="relative bg-white p-4 rounded-lg shadow cursor-pointer"
            @click="openPopup(member)"
            @mouseenter="handleMouseEnter(index)"
            @mouseleave="handleMouseLeave"
          >
            <!-- จุด 3 จุด: แสดงเฉพาะตอน hover -->
            <div
              class="absolute top-2 right-2 z-20"
              v-if="hoveredIndex === index"
              @click.stop
            >
              <button
                class="text-gray-500 hover:text-black focus:outline-none"
                @click="toggleDropdown(index)"
              >
                ⋮
              </button>

              <!-- เมนู dropdown: แสดงเมื่อคลิก ⋮ -->
              <div
                v-if="activeDropdownIndex === index"
                class="absolute right-0 mt-2 w-28 bg-white border border-gray-300 rounded shadow-md"
              >
                <button
                  class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  @click="editMember(member)"
                >
                  ✏️ แก้ไข
                </button>
                <button
                  class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-500"
                  @click="deleteMember(member)"
                >
                  🗑️ ลบ
                </button>
              </div>
            </div>

            <!-- ส่วนเดิมของการ์ด -->
            <div class="flex justify-between items-center mb-2">
              <div class="flex items-center space-x-3">
                <img
                  :src="member?.profile_pic || '/user.png'"
                  referrerpolicy="no-referrer"
                  alt="profile"
                  class="w-10 h-10 border-2 border-gray-300 rounded-full object-cover"
                />
                <div class="font-semibold">
                  {{ member.firstname }} {{ member.lastname }}
                  <span class="text-[12px] font-thin">{{
                    formatDate(member.created_at)
                  }}</span>
                </div>
              </div>
              <span class="bg-gray-200 text-xs px-3 py-1 rounded-full">
                {{ member.role }}
              </span>
            </div>

            <!-- เนื้อหา -->
            <p><strong>สิ่งที่ทำวันนี้</strong><br />{{ member.today }}</p>

            <!-- Daily -->
            <template v-if="member.type === 'daily'">
              <div class="flex items-center gap-2">
                <strong>ปัญหาวันนี้</strong>
                <template v-if="member.problem_level">
                  <span
                    class="inline-block w-3 h-3 rounded-full"
                    :class="{
                      'bg-green-500': member.problem_level === 'minor',
                      'bg-yellow-500': member.problem_level === 'moderate',
                      'bg-red-500': member.problem_level === 'critical',
                    }"
                  ></span>
                </template>
                <template v-else>
                  <span class="text-sm text-gray-500">-</span>
                </template>
              </div>
              <p class="mt-1 text-sm text-gray-700">
                {{ member.problem || "-" }}
              </p>
              <p>
                <strong>พรุ่งนี้ทำอะไร</strong><br />{{
                  member.tomorrow || "-"
                }}
              </p>
            </template>

            <!-- Retrospective -->
            <template
              v-else-if="
                member.type === 'friday' || member.type === 'retrospective'
              "
            >
              <p><strong>Good</strong><br />{{ member.good || "-" }}</p>
              <p><strong>Bad</strong><br />{{ member.bad || "-" }}</p>
              <p><strong>Try</strong><br />{{ member.try || "-" }}</p>
              <p>
                <strong>Next Sprint</strong><br />{{
                  member.next_sprint || "-"
                }}
              </p>
            </template>
          </div>
        </div>

        <ScrumPopup
          v-if="showPopupp"
          :visible="showPopupp"
          :data="selectedMember"
          :socket="socket"
          @close="showPopupp = false"
        />

        <div>
          <div class="bg-white rounded-lg p-4 shadow">
            <h2 class="text-xl font-semibold mb-4 text-center">
              Scrum's Summary
            </h2>
            <div class="flex justify-between px-5">
              <div>
                <div class="mb-2">
                  <p class="font-bold">คนที่ส่งแล้ว</p>
                  <ul class="ml-4 text-sm space-y-1">
                    <li v-for="user in submittedUsers" :key="user.id">
                      - {{ user.firstname }} {{ user.lastname }} ({{
                        user.position
                      }}) {{ user.scrum_point }} คะแนน
                    </li>
                  </ul>
                </div>

                <p class="font-bold mt-4">คนที่ยังไม่ได้ส่ง</p>
                <ul class="ml-4 text-sm space-y-1">
                  <li v-for="member in notSubmittedUsers" :key="member.id">
                    - {{ member.firstname }} {{ member.lastname }} ({{
                      member.position
                    }})
                  </li>
                </ul>
              </div>

              <div v-if="project" class="mt-4 text-sm">
                <p>
                  <strong>Deadline Date:</strong>
                  {{ formatDate(project.deadline_date) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Conditional Buttons -->
          <div class="space-y-4 mt-6">
            <template v-if="position === 'Project Manager'">
              <div class="flex gap-3">
                <button
                  @click="openEditModal(projectId)"
                  class="w-full bg-white text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-50"
                >
                  Edit Project
                </button>
                <button
                  class="bg-[#DD5B5B] rounded-[5px] text-white px-5"
                  @click="handleDelete"
                >
                  Delete Project
                </button>
              </div>
              <button
                @click="markProjectAsDone"
                class="w-full bg-white text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-50"
              >
                Mark Project as done
              </button>
              <button
                @click="showPopup = true"
                class="w-full bg-white text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-50"
              >
                Create Daily-scrum
              </button>
              <div>
                <button
                  class="w-full bg-white text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-50"
                  @click="goToHistory"
                >
                  History
                </button>
              </div>
            </template>
            <template v-else>
              <button
                @click="showPopup = true"
                class="w-full bg-white text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-50"
              >
                Create Daily-scrum
              </button>
              <div>
                <button
                  class="w-full bg-white text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-50"
                  @click="goToHistory"
                >
                  History
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <EditProject
      v-if="showModal"
      :project="selectedProject"
      @close="showModal = false"
      @submit="handleUpdatedProject"
    />

    <!-- Popup Modal -->
    <div
      v-if="showPopup"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div class="space-y-4">
          <!-- Daily-scrum Type -->
          <div class="flex justify-between">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Daily-scrum Type</label
              >
              <select
                v-model="formData.type"
                class="w-full border border-gray-300 rounded px-5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily scrum</option>
                <option value="friday">Friday Scrum</option>
                <option value="retrospective">Retrospective</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Date</label
              >
              <input
                type="date"
                v-model="formData.created_at"
                class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Dynamic fields based on scrumType -->
          <div v-if="formData.type === 'daily'">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >สิ่งที่ทำวันนี้</label
            >
            <textarea
              v-model="formData.today_task"
              class="w-full border rounded px-3 py-2 h-20"
              placeholder="สิ่งที่ทำวันนี้..."
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
              placeholder="ปัญหาที่เจอ..."
            />
            <label class="block text-sm font-medium text-gray-700 mb-1 mt-2"
              >พรุ่งนี้ทำอะไร</label
            >
            <textarea
              v-model="formData.tomorrow_task"
              class="w-full border rounded px-3 py-2 h-20"
              placeholder="สิ่งที่จะทำพรุ่งนี้..."
            />
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1 mt-2">
                แนบไฟล์ (เช่น ภาพ, PDF ฯลฯ)
              </label>
              <input
                type="file"
                multiple
                @change="handleFileChange"
                class="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div v-else-if="formData.type === 'friday'">
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
              <label class="block text-sm font-medium text-gray-700 mb-1 mt-2">
                แนบไฟล์ (เช่น ภาพ, PDF ฯลฯ)
              </label>
              <input
                type="file"
                multiple
                @change="handleFileChange"
                class="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div v-else-if="formData.type === 'retrospective'">
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
              <label class="block text-sm font-medium text-gray-700 mb-1 mt-2">
                แนบไฟล์ (เช่น ภาพ, PDF ฯลฯ)
              </label>
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
              @click="handleCancel"
              class="bg-[#D1FAE5] text-black py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              @click="handleSubmit"
              class="bg-[#10B981] text-[#1F2937] py-2 px-4 rounded"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import io from "socket.io-client";
import ScrumPopup from "../ScrumPopup.vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";
import EditProject from "../../components/EditProject.vue";

const route = useRoute();
const router = useRouter();
const position = route.query.position;
const projectId = route.query.projectId;
const project = ref(null);
const token = ref(null);
const showPopup = ref(false);
const showPopupp = ref(false);
const selectedMember = ref(null);
const showModal = ref(false);
const selectedProject = ref(null);
const currentProjectId = ref(null);
const scrumMemberss = ref([]);
const allMembers = ref([]);
const submittedUsers = ref([]);
const notSubmittedUsers = ref([]);
const fileInputs = ref([]);
const hoveredIndex = ref(null);
const activeDropdownIndex = ref(null);
// const socket = io('http://localhost:3000');
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// const addProject = (newProject) => {
//   console.log("New project added:", newProject);
// };

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
  project_id: null, // <-- ค่าเริ่มต้น จะเซตทีหลัง
  created_at: "",
  files: [],
});

function handleMouseEnter(index) {
  hoveredIndex.value = index;
}

function handleMouseLeave() {
  hoveredIndex.value = null;
}

function toggleDropdown(index) {
  activeDropdownIndex.value =
    activeDropdownIndex.value === index ? null : index;
}

function editMember(member) {
  console.log("Edit:", member);
}


async function deleteMember(member) {
  token.value = localStorage.getItem("token");

  const result = await Swal.fire({
    title: `ต้องการลบ Scrum ของ ${member.firstname} ${member.lastname} หรือไม่?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก',
  });

  if (!result.isConfirmed) return;

  try {
    const id = member.id;
    const response = await axios.delete(`${backendUrl}/api/daily-scrum/${id}`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        "ngrok-skip-browser-warning": "true",
      },
      withCredentials: true,
    });

    await Swal.fire({
      icon: 'success',
      title: 'ลบสำเร็จ',
      text: `${member.firstname} ${member.lastname} ถูกลบเรียบร้อยแล้ว`,
      timer: 1500,
      showConfirmButton: false,
    });

    location.reload(); 

  } catch (error) {
    console.error('Error deleting scrum:', error);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถลบรายการได้ กรุณาลองใหม่',
    });
  }
}

const openEditModal = (id) => {
  currentProjectId.value = id;
  showModal.value = true;
};

const fetchProjects = async () => {
  // ดึงข้อมูลทั้งหมด
};

const handleUpdatedProject = (updatedProject) => {
  console.log("Project updated:", updatedProject);
  fetchProjects();
};

const fetchProject = async () => {
  token.value = localStorage.getItem("token");
  try {
    const res = await axios.get(`${backendUrl}/api/projects/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        "ngrok-skip-browser-warning": "true",
      },
      withCredentials: true,
    });
    project.value = res.data.project;
  } catch (err) {
    console.error("Error fetching project:", err.message);
  }
};

const handleDelete = async () => {
  const confirm = await Swal.fire({
    title: "คุณแน่ใจหรือไม่?",
    text: "การลบนี้ไม่สามารถย้อนกลับได้!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#DD5B5B",
    cancelButtonColor: "#aaa",
    confirmButtonText: "ลบโปรเจกต์",
    cancelButtonText: "ยกเลิก",
  });

  if (confirm.isConfirmed) {
    token.value = localStorage.getItem("token");
    try {
      await axios.delete(`${backendUrl}/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "ngrok-skip-browser-warning": "true",
        },
        withCredentials: true,
      });

      Swal.fire("ลบสำเร็จ!", "โปรเจกต์ถูกลบเรียบร้อยแล้ว", "success");
      router.push("/homepage");
    } catch (err) {
      console.error("Error deleting project:", err.message);
      Swal.fire("เกิดข้อผิดพลาด", err.message, "error");
    }
  }
};

const markProjectAsDone = async () => {
  token.value = localStorage.getItem("token");
  try {
    const response = await axios.patch(
      `${backendUrl}/api/projects/${projectId}`,
      {
        status: "done",
      },
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "ngrok-skip-browser-warning": "true",
        },
        withCredentials: true,
      }
    );

    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Project marked as done!",
    });

    router.push("/homepage");
  } catch (error) {
    console.error("Error updating project status:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Could not update the project status.",
    });
  }
};

onMounted(() => {
  if (projectId) fetchProject();
});

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
    // สมมุติว่า response = { scrums: [...] }
    const scrums = res.data.scrums;

    // map ให้ง่ายต่อการใช้กับ template
    scrumMemberss.value = res.data.scrums.map((scrum) => ({
      id: scrum.id,
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
      role: scrum.user.position,
      file: scrum.files,
      created_at: scrum.created_at,
    }));
  } catch (err) {
    console.error("Error fetching scrum data:", err);
  }
};

onMounted(() => {
  if (projectId) {
    fetchScrumData();
  }
});

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0"); // เติม 0 ถ้าต่ำกว่า 10
  const month = String(date.getMonth() + 1).padStart(2, "0"); // เดือนเริ่มจาก 0 ต้อง +1
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getTodayDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // เดือนเริ่มที่ 0
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};

onMounted(async () => {
  token.value = localStorage.getItem("token");

  try {
    // 1. ดึงสมาชิกทั้งหมดจากโปรเจกต์
    const projectRes = await axios.get(
      `${backendUrl}/api/projects/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "ngrok-skip-browser-warning": "true",
        },
        withCredentials: true,
      }
    );
    allMembers.value = projectRes.data.project.members || [];

    // 2. ดึงรายการ scrum ที่ส่งแล้ว
    const scrumRes = await axios.get(
      `${backendUrl}/api/daily-scrum/project/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "ngrok-skip-browser-warning": "true",
        },
        withCredentials: true,
      }
    );

    // 3. รวม user ที่ส่งแล้ว (ใช้ Set เพื่อป้องกันซ้ำ)
    const seenUserIds = new Set();
    submittedUsers.value = scrumRes.data.scrums
      .map((scrum) => scrum.user)
      .filter((user) => {
        if (!seenUserIds.has(user.id)) {
          seenUserIds.add(user.id);
          return true;
        }
        return false;
      });

    // 4. คำนวณคนที่ยังไม่ได้ส่ง
    notSubmittedUsers.value = allMembers.value.filter(
      (member) => !seenUserIds.has(member.id)
    );
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
  }
});

const openPopup = (member) => {
  selectedMember.value = member;
  showPopupp.value = true;
};

const handleFileChange = (e) => {
  fileInputs.value = Array.from(e.target.files);
};

const handleSubmit = async () => {
  token.value = localStorage.getItem("token");

  try {
    const data = new FormData();

    // กรองและเพิ่มเฉพาะ field ที่มีค่า ไม่เป็น undefined หรือ null
    for (const key in formData.value) {
      const value = formData.value[key];
      if (value !== undefined && value !== null && value !== "") {
        data.append(key, value);
      }
    }

    // เพิ่มไฟล์
    fileInputs.value.forEach((file) => {
      data.append("files", file);
    });

    const response = await axios.post(`${backendUrl}/api/daily-scrum`, data, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        "ngrok-skip-browser-warning": "true",
      },
      withCredentials: true,
    });

    console.log("Submitted:", response.data);
    showPopup.value = false;
    location.reload();
  } catch (error) {
    console.error("Error submitting daily scrum:", error);
  }
};

onMounted(() => {
  const projectId = route.query.projectId;
  if (projectId) {
    formData.value.project_id = Number(projectId); // แปลงเป็น number (ตามที่ backend อาจต้องการ)
  }
});

const handleCancel = () => {
  showPopup.value = false;
};

const goToHistory = () => {
  router.push(`/history/${projectId}`);
};
</script>
