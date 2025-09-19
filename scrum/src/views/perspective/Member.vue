<template>
  <div class="min-h-screen bg-[#F0FDF4] font-noto pt-12">
    <div class="p-6">
      <div class="flex justify-between items-center text-black">
        <div v-if="project">
          <h1 class="text-lg font-medium">
            <div class="flex gap-2">
              <router-link to="/homepage">
                <img src="/left-arrow.png" alt="" class="w-6 h-6" />
              </router-link>
              <span>Project's Title:</span>
              <span class="font-semibold">{{ project.title }}</span>
            </div>
          </h1>
        </div>
        <p>DATE : {{ getTodayDate() }}</p>
      </div>

      <div class="lg:px-[140px]">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <!-- ฝั่งซ้าย: Scrum Summary + ปุ่ม -->
          <div
            :class="[
              project?.status === 'done'
                ? 'lg:col-span-3 flex justify-center'
                : 'lg:col-span-2',
            ]"
          >
            <div>
              <div class="bg-white rounded-lg p-4 shadow relative">
                <!-- หัวข้อ -->
                <h2 class="text-xl font-semibold text-center">
                  Scrum's Summary
                </h2>

                <!-- เมนู 3 จุด (เฉพาะ Project Manager) -->
                <div
                  v-if="position === 'Project Manager'"
                  class="absolute top-2 right-2"
                >
                  <div class="relative" @click.stop="showMenu = !showMenu">
                    <!-- ไอคอน 3 จุด -->
                    <button class="p-2 rounded hover:bg-gray-100">⋮</button>

                    <!-- เมนู dropdown -->
                    <div
                      v-if="showMenu"
                      class="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10"
                    >
                      <button
                        @click="openEditModal(projectId)"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Edit Project
                      </button>
                      <button
                        @click="handleDelete"
                        class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Delete Project
                      </button>
                    </div>
                  </div>
                </div>

                <!-- เนื้อหาเดิม -->
                <div v-if="project" class="mt-4 mb-4 text-sm text-center">
                  <p>
                    <strong>Deadline Date:</strong>
                    {{ formatDate(project.deadline_date) }}
                  </p>
                </div>

                <div class="flex justify-center px-5">
                  <div class="w-full">
                    <div
                      v-if="isLoading"
                      class="text-center py-4 text-gray-500"
                    >
                      กำลังโหลดข้อมูล...
                    </div>
                    <div class="mb-4">
                      <p class="font-bold mb-2">คนที่ส่งแล้ว</p>
                      <ul class="ml-4 text-sm space-y-1">
                        <li
                          v-for="user in submittedUsers"
                          :key="user.id"
                          class="grid grid-cols-2 gap-4"
                        >
                          <div>
                            {{ user.firstname }} {{ user.lastname }} ({{
                              user.position
                            }})
                          </div>
                          <div class="text-right font-medium">
                            {{ user.scrum_point }} คะแนน
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div class="border-t pt-2">
                      <p class="font-bold mb-2">คนที่ยังไม่ได้ส่ง</p>
                      <ul class="ml-4 text-sm space-y-1">
                        <li
                          v-for="member in notSubmittedUsers"
                          :key="member.id"
                          class="grid grid-cols-2 gap-4"
                        >
                          <div>
                            {{ member.firstname }} {{ member.lastname }} ({{
                              member.position
                            }})
                          </div>
                          <div class="text-right font-medium">
                            {{ member.scrum_point }} คะแนน
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ปุ่ม -->
              <div class="space-y-4 mt-6">
                <template v-if="position === 'Project Manager'">
                  <div class="flex gap-4">
                    <button
                      @click="markProjectAsDone"
                      class="w-full bg-white text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-50"
                    >
                      Mark Project as done
                    </button>
                    <button
                      @click="goToHistory"
                      class="w-full bg-white text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-50"
                    >
                      Post History
                    </button>
                  </div>
                  <div>
                    <button
                      v-if="!hasSubmittedToday"
                      @click="showPopup = true"
                      class="w-full bg-white text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-50"
                    >
                      Create post
                    </button>

                    <button
                      v-else
                      @click="openEditPopup(getTodayScrumId())"
                      class="w-full bg-white text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-blue-600"
                    >
                      Update post
                    </button>
                  </div>
                </template>

                <template v-else>
                  <button
                    @click="goToHistory"
                    class="w-full bg-white text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-50"
                  >
                    Post History
                  </button>
                  <div>
                    <button
                      v-if="!hasSubmittedToday"
                      @click="showPopup = true"
                      class="w-full bg-white text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-50"
                    >
                      Create post
                    </button>

                    <button
                      v-else
                      @click="openEditPopup(getTodayScrumId())"
                      class="w-full bg-white text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-blue-600"
                    >
                      Update post
                    </button>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- ฝั่งขวา: Scrum Members -->
          <div
            class="lg:col-span-1 space-y-4"
            v-if="project?.status !== 'done'"
          >
            <div
              v-for="(member, index) in scrumMemberss"
              :key="index"
              class="relative bg-white p-4 rounded-lg shadow cursor-pointer"
              @click="openPopup(member)"
              @mouseenter="handleMouseEnter(index)"
              @mouseleave="handleMouseLeave"
            >
              <!-- จุด 3 จุด -->
              <div
                class="absolute top-2 right-2 z-20"
                v-if="hoveredIndex === index"
                @click.stop
              >
                <button
                  class="text-gray-500 w-6 rounded-full hover:text-black hover:bg-gray-100 focus:outline-none"
                  @click="toggleDropdown(index)"
                >
                  ⋮
                </button>

                <div
                  v-if="activeDropdownIndex === index"
                  class="absolute right-0 mt-2 w-28 bg-white border border-gray-300 rounded shadow-md"
                >
                  <button
                    class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-500"
                    @click="deleteMember(member)"
                  >
                    <div class="flex gap-2 text-center">
                      <img src="/delete.png" alt="" class="w-4 h-4" />
                      <div><span>ลบ</span></div>
                    </div>
                  </button>
                </div>
              </div>

              <!-- การ์ด -->
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
                    <span class="text-[10px] font-medium">
                      {{ formatDate(member.created_at) }}
                    </span>
                  </div>
                </div>
                <span class="bg-gray-200 text-xs px-3 py-1 rounded-full">
                  {{ member.role }}
                </span>
              </div>

              <!-- เนื้อหา -->
              <p>
                <strong>สิ่งที่ทำวันนี้</strong><br />{{ member.today || "-" }}
              </p>

              <!-- Daily -->
              <template v-if="member.type === 'daily'">
                <div class="flex items-center gap-2">
                  <strong>ปัญหาวันนี้</strong>
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
                  member.type === 'weekly' || member.type === 'retrospective'
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
        </div>
      </div>
    </div>

    <ScrumComment
      v-if="showPopupp"
      :visible="showPopupp"
      :data="selectedMember"
      @close="showPopupp = false"
    />

    <EditProject
      v-if="showModal"
      :project="selectedProject"
      @close="showModal = false"
      @submit="handleUpdatedProject"
    />

    <!-- Popup แยกออกมาเป็น component -->
    <ScrumForm
      v-if="showPopup"
      :visible="showPopup"
      :projectId="Number(projectId)"
      :canSubmitYesterday="canSubmitYesterday"
      @close="showPopup = false"
      @submitted="handleSubmitted"
    />

    <EditScrum
      v-if="showwPopup"
      :visible="showwPopup"
      :scrumId="selectedScrumId"
      :projectId="Number(projectId)"
      :canSubmitYesterday="canSubmitYesterday"
      @close="showwPopup = false"
      @submitted="handleUpdatedScrum"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter, onBeforeRouteUpdate } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";

import ScrumComment from "../ScrumComment.vue";
import EditProject from "../../components/EditProject.vue";
import ScrumForm from "../../components/ScrumForm.vue";
import EditScrum from "../../components/EditScrum.vue";

const user = JSON.parse(localStorage.getItem("user")) || {};
const userId = user.id;
const token = ref(localStorage.getItem("token"));

const route = useRoute();
const router = useRouter();
const projectId = route.params.id;

const project = ref(null);
const position = ref(null);
const scrumMemberss = ref([]);
const allMembers = ref([]);
const submittedUsers = ref([]);
const notSubmittedUsers = ref([]);
const hasSubmittedToday = ref(false);
const hoveredIndex = ref(null);
const activeDropdownIndex = ref(null);
const canSubmitYesterday = true;
const selectedScrumId = ref(null);
const showMenu = ref(false);
const showPopup = ref(false);
const showPopupp = ref(false);
const showwPopup = ref(false);
const selectedMember = ref(null);
const isLoading = ref(false);
const showModal = ref(false);
const selectedProject = ref(null);
const currentProjectId = ref(null);

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function handleSubmitted() {
  window.location.reload();
}

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
function openPopup(member) {
  selectedMember.value = member;
  showPopupp.value = true;
}
const openEditModal = (id) => {
  currentProjectId.value = id;
  showModal.value = true;
};

const fetchProject = async () => {
  try {
    const res = await axios.get(`${backendUrl}/api/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${token.value}` },
      withCredentials: true,
    });
    project.value = res.data.project;
    allMembers.value = project.value.members || [];

    const member = allMembers.value.find((m) => m.id === userId);
    position.value = member ? member.position : "Member";
  } catch (err) {
    console.error("Error fetching project:", err.message);
  }
};

const fetchScrumData = async () => {
  try {
    const res = await axios.get(
      `${backendUrl}/api/posts/project/${projectId}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        withCredentials: true,
      }
    );

    const scrums = res.data.posts;
    const todayStr = new Date().toISOString().split("T")[0];

    // 🎯 Filter เฉพาะโพสต์วันนี้ + map ข้อมูล
    scrumMemberss.value = scrums
      .filter((post) => {
        const createdDate = new Date(post.created_at)
          .toISOString()
          .split("T")[0];
        return createdDate === todayStr;
      })
      .map((post) => ({
        id: post.id,
        type: post.type,
        today: post.today_task,
        problem: post.problem,
        tomorrow: post.tomorrow_task,
        good: post.good,
        bad: post.bad,
        try: post.try,
        next_sprint: post.next_sprint,
        user_id: post.user.id,
        firstname: post.user.firstname,
        lastname: post.user.lastname,
        profile_pic: post.user.profile_pic,
        role: post.user.position,
        file: post.files,
        created_at: post.created_at,
      }));

    // ✅ ตรวจสอบว่าผู้ใช้ submit วันนี้หรือยัง
    hasSubmittedToday.value = scrumMemberss.value.some(
      (post) => post.user_id === userId
    );

    // ✅ Submitted / Not submitted
    const todayScrums = scrums.filter((post) => {
      const scrumDate = new Date(post.created_at).toISOString().split("T")[0];
      return scrumDate === todayStr;
    });

    const seenUserIds = new Set();
    submittedUsers.value = todayScrums
      .map((post) => post.user)
      .filter((user) => {
        if (!seenUserIds.has(user.id)) {
          seenUserIds.add(user.id);
          return true;
        }
        return false;
      });

    notSubmittedUsers.value = allMembers.value.filter(
      (member) => !seenUserIds.has(member.id)
    );

    // console.log(scrums);
  } catch (err) {
    console.error("Error fetching post data:", err);
  }
};

// ✅ เรียกตอน mounted
onMounted(async () => {
  await fetchScrumData();

  // 🔔 ตรวจสอบว่าเปิดจาก notification แบบ new_comment
  if (route.query.popup === "comment") {
    const dailyScrumId = localStorage.getItem("post_id");

    if (dailyScrumId) {
      // หา member ที่ตรงกับ dailyScrumId
      const member = scrumMemberss.value.find(
        (m) => m.id === Number(dailyScrumId)
      );

      if (member) {
        openPopup(member);
      }
    }
  }
});


const getTodayScrumId = () => {
  const todayScrum = scrumMemberss.value.find((s) => s.user_id === userId);
  return todayScrum ? todayScrum.id : null;
};

const openEditPopup = (id) => {
  if (!id) return;
  selectedScrumId.value = id;
  showwPopup.value = true;
};

async function deleteMember(member) {
  const result = await Swal.fire({
    title: `ต้องการลบ Scrum ของ ${member.firstname} ${member.lastname} หรือไม่?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#aaa",
    confirmButtonText: "ลบ",
    cancelButtonText: "ยกเลิก",
  });
  if (!result.isConfirmed) return;

  try {
    await axios.delete(`${backendUrl}/api/posts/${member.id}`, {
      headers: { Authorization: `Bearer ${token.value}` },
      withCredentials: true,
    });
    await Swal.fire({
      icon: "success",
      title: "ลบสำเร็จ",
      text: `${member.firstname} ${member.lastname} ถูกลบเรียบร้อยแล้ว`,
      timer: 1500,
      showConfirmButton: false,
    });
    fetchScrumData();
  } catch (error) {
    console.error("Error deleting scrum:", error);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถลบรายการได้ กรุณาลองใหม่",
    });
  }
}

const handleDelete = async () => {
  const confirm = await Swal.fire({
    title: "คุณแน่ใจหรือไม่?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#DD5B5B",
    cancelButtonColor: "#aaa",
    confirmButtonText: "ลบโปรเจกต์",
    cancelButtonText: "ยกเลิก",
  });
  if (!confirm.isConfirmed) return;

  try {
    await axios.delete(`${backendUrl}/api/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${token.value}` },
      withCredentials: true,
    });
    Swal.fire("ลบสำเร็จ!", "โปรเจกต์ถูกลบเรียบร้อยแล้ว", "success");
    router.push("/homepage");
  } catch (err) {
    console.error("Error deleting project:", err.message);
    Swal.fire("เกิดข้อผิดพลาด", err.message, "error");
  }
};

const markProjectAsDone = async () => {
  try {
    await axios.patch(
      `${backendUrl}/api/projects/${projectId}`,
      { status: "done" },
      {
        headers: { Authorization: `Bearer ${token.value}` },
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

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
const getTodayDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};
const goToHistory = () => {
  router.push(`/history/${projectId}`);
};

onMounted(() => {
  fetchProject();
  fetchScrumData();
});
</script>
