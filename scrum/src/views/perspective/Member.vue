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
            class="bg-white p-4 rounded-lg shadow cursor-pointer"
            @click="openPopup(member)"
          >
            <div class="flex justify-between items-center mb-2">
              <div class="flex items-center space-x-3">
                <div>
                  <img
                    :src="member?.profile_pic || '/user.png'"
                    referrerpolicy="no-referrer"
                    alt="profile"
                    class="w-10 h-10 border-2 border-gray-300 rounded-full object-cover"
                  />
                </div>
                <div class="font-semibold">
                  {{ member.firstname }} {{ member.lastname }}
                </div>
              </div>
              <span class="bg-gray-200 text-xs px-3 py-1 rounded-full">
                {{ member.role }}
              </span>
            </div>

            <!-- Shared -->
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

            <!-- Friday / Retrospective -->
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
                <router-link to="/history/">
                  <button
                    class="w-full bg-white text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-50"
                  >
                    History
                  </button>
                </router-link>
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
                v-model="formData.scrumType"
                class="w-full border border-gray-300 rounded px-5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Default scrum">Default scrum</option>
                <option value="Sprint Planning">Friday Scrum</option>
                <option value="Sprint Review">Sprint Review</option>
                <option value="Sprint Retrospective">Retrospective</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Date</label
              >
              <input
                type="date"
                v-model="formData.date"
                class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Dynamic fields based on scrumType -->
          <div v-if="formData.scrumType === 'Default scrum'">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >กิจกรรม</label
            >
            <textarea
              v-model="formData.activity"
              class="w-full border rounded px-3 py-2 h-20"
              placeholder="กิจกรรมที่ทำ..."
            />
            <label class="block text-sm font-medium text-gray-700 mb-1 mt-2"
              >ปัญหา</label
            >
            <textarea
              v-model="formData.problem"
              class="w-full border rounded px-3 py-2 h-20"
              placeholder="ปัญหาที่เจอ..."
            />
            <label class="block text-sm font-medium text-gray-700 mb-1 mt-2"
              >พรุ่งนี้จะทำ</label
            >
            <textarea
              v-model="formData.tomorrow"
              class="w-full border rounded px-3 py-2 h-20"
              placeholder="สิ่งที่จะทำพรุ่งนี้..."
            />
          </div>

          <div v-else-if="formData.scrumType === 'Sprint Planning'">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >สิ่งที่ทำวันนี้</label
            >
            <textarea
              v-model="formData.sprintGoal"
              class="w-full border rounded px-3 py-2 h-20"
            />
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Good</label
            >
            <textarea
              v-model="formData.sprintGoal"
              class="w-full border rounded px-3 py-2 h-20"
            />
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Bad</label
            >
            <textarea
              v-model="formData.sprintGoal"
              class="w-full border rounded px-3 py-2 h-20"
            />
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Try</label
            >
            <textarea
              v-model="formData.sprintGoal"
              class="w-full border rounded px-3 py-2 h-20"
            />
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Next Sprint</label
            >
            <textarea
              v-model="formData.sprintGoal"
              class="w-full border rounded px-3 py-2 h-20"
            />
          </div>

          <div v-else-if="formData.scrumType === 'Sprint Review'">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >งานที่เสร็จ</label
            >
            <textarea
              v-model="formData.completedWork"
              class="w-full border rounded px-3 py-2 h-20"
              placeholder="ระบุงานที่เสร็จ..."
            />
          </div>

          <div v-else-if="formData.scrumType === 'Sprint Retrospective'">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Good</label
            >
            <textarea
              v-model="formData.good"
              class="w-full border rounded px-3 py-2 h-20"
            />
            <label class="block text-sm font-medium text-gray-700 mb-1 mt-2"
              >Bad</label
            >
            <textarea
              v-model="formData.bad"
              class="w-full border rounded px-3 py-2 h-20"
            />
            <label class="block text-sm font-medium text-gray-700 mb-1 mt-2"
              >Try</label
            >
            <textarea
              v-model="formData.bad"
              class="w-full border rounded px-3 py-2 h-20"
            />
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
// const socket = io('http://localhost:3000');
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const addProject = (newProject) => {
  console.log("New project added:", newProject);
};

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

const submitted = [
  { name: "Firstname Lastname", role: "BA" },
  { name: "Firstname Lastname", role: "UX/UI" },
  { name: "Firstname Lastname", role: "Back-end" },
  { name: "Firstname Lastname", role: "Front-end" },
];

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

const formData = ref({
  scrumType: "Default scrum",
  date: "",
  activity: "",
  problem: "",
  tomorrow: "",
  sprintGoal: "",
  completedWork: "",
  good: "",
  bad: "",
});

const resetForm = () => {
  formData.value = {
    scrumType: "Default scrum",
    date: "",
    activity: "",
    problem: "",
    tomorrow: "",
    sprintGoal: "",
    completedWork: "",
    good: "",
    bad: "",
  };
};

const handleSubmit = () => {
  console.log("Form submitted:", { ...formData.value });
  showPopup.value = false;
  resetForm();
};

const handleCancel = () => {
  showPopup.value = false;
  resetForm();
};

const goToHistory = () => {
  router.push(`/history/${projectId}`)
}
</script>
