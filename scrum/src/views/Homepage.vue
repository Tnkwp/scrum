<template>
  <div class="min-h-screen bg-[#F0FDF4] p-6 font-noto pt-20">
    <div>
      <div>
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <!-- Add New Project -->
          <div
            @click="showModal = true"
            class="bg-white rounded-lg h-40 flex justify-center items-center shadow-md cursor-pointer"
          >
            <div class="text-center cursor-pointer">
              <div class="text-4xl font-bold">+</div>
              <div>Add Project Title</div>
            </div>
          </div>

          <!-- Project Card Component -->
          <ProjectCard
            v-for="project in sortedProjects"
            :key="project.id"
            :title="project.title"
            :status="formatStatus(project.status)"
            :end="formatDate(project.deadline_date)"
            :owner="getOwnerImage(project.members)"
            :members="project.members"
            :memberImages="getMemberImages(project.members)"
            :projectId="project.id"
            :isPinned="project.members.find((m) => m.id === currentUserId.value)?.is_pinned"
            :currentUserId="currentUserId.value"
            @toggle-pin="togglePin"
          />
        </div>
        <ProjectFormModal
          v-if="showModal"
          @close="showModal = false"
          @submit="addProject"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";
import ProjectCard from "./ProjectCard.vue";
import ProjectFormModal from "../components/ProjectFormModal.vue";
import { useUserStore } from "../stores/userStore.js";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const showModal = ref(false);
const projects = ref([]);
const token = ref(null);
const userStore = useUserStore();
const currentUserId = computed(() => userStore.user?.id ?? null);
console.log("ProjectCard", ProjectCard);
const addProject = (newProject) => {
  console.log("New project added:", newProject);
  fetchProjects();
};

const fetchProjects = async () => {
  token.value = localStorage.getItem("token");
  try {
    const response = await axios.get(`${backendUrl}/api/projects`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        "ngrok-skip-browser-warning": "true",
      },
      withCredentials: true,
    });

    projects.value = response.data.projects || [];
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
};

const formatStatus = (status) => {
  if (status === "in_progress") return "In progress";
  if (status === "done") return "Done";
  return status;
};

const formatDate = (dateString) => {
  if (!dateString) return "XX/XX/XXXX";
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH");
};

const defaultAvatar = "/user.png"; // ใส่ path รูป default ของคุณ

// ฟังก์ชันดึงภาพเจ้าของโปรเจกต์ (สมมติเจ้าของคือสมาชิกคนแรก)
const getOwnerImage = (members) => {
  if (!members || members.length === 0) return defaultAvatar;
  const owner = members.find((member) => member.position === "Project Manager");
  return owner?.profile_pic || defaultAvatar;
};

// ฟังก์ชันดึงภาพสมาชิกที่เหลือ (เว้นเจ้าของ)
const getMemberImages = (members) => {
  if (!members || members.length === 0) return [];

  return members
    .filter((member) => member.position !== "Project Manager")
    .map((member) => member.profile_pic || defaultAvatar);
};

const handleTogglePin = (id) => {
  const project = projects.value.find((p) => p.id === id);
  if (project) {
    project.pinned = !project.pinned;
  }
};

const sortedProjects = computed(() => {
  if (!currentUserId.value) return projects.value;

  return [...projects.value].sort((a, b) => {
    const aPinned = a.members.find(m => m.id === currentUserId.value)?.is_pinned ?? false;
    const bPinned = b.members.find(m => m.id === currentUserId.value)?.is_pinned ?? false;

    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return a.id - b.id;
  });
});

// สลับ pin/unpin
const togglePin = async (projectId) => {
  token.value = localStorage.getItem("token");
  const userId = currentUserId.value;

  if (!userId) {
    console.warn("User not logged in or user ID not found");
    return;
  }

  const project = projects.value.find((p) => p.id === projectId);
  if (!project) {
    console.warn("Project not found:", projectId);
    return;
  }

  const member = project.members.find((m) => m.id === userId);
  if (!member) {
    console.warn("User not found in project members");
    return;
  }


  const currentlyPinned = member.is_pinned;

  try {
    await axios.patch(
      `${backendUrl}/api/projects/${projectId}/pin`,
      {
        userId,
        is_pinned: !currentlyPinned,
      },
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "ngrok-skip-browser-warning": "true",
        },
        withCredentials: true,
      }
    );

    const memberIndex = project.members.findIndex((m) => m.id === userId);
    if (memberIndex !== -1) {
      project.members[memberIndex].is_pinned = !currentlyPinned;
    }
  } catch (err) {
    console.error("Failed to toggle pin:", err);
  }
};

// onMounted(() => {
//   const savedPins = localStorage.getItem("pinnedProjectIds");
//   if (savedPins) {
//     pinnedProjectIds.value = JSON.parse(savedPins);
//   }
// });

// watch(
//   pinnedProjectIds,
//   (newVal) => {
//     localStorage.setItem("pinnedProjectIds", JSON.stringify(newVal));
//   },
//   { deep: true }
// );

onMounted(fetchProjects);
</script>

<style scoped></style>
