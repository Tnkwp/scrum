<template>
  <div
    class="bg-white rounded-xl p-4 shadow-md relative  text-sm cursor-pointer"
    @click="goToProjectPage"
  >
    <!-- Status badge -->
    <span
      class="absolute top-2 right-10 text-white text-xs px-3 py-1 rounded-full"
      :class="{
        'bg-red-400': status === 'In progress',
        'bg-green-400': status === 'Done',
      }"
    >
      {{ status || "In progress" }}
    </span>

    <!-- Pin icon -->
    <button
      class="absolute top-2 right-2"
      @click.stop="emit('toggle-pin', projectId)"
    >
      <img
        :src="isPinned ? '/push-pinn.png' : '/push-pin.png'"
        alt="pin"
        class="w-6 h-6"
      />
    </button>

    <!-- Title and basic info -->
    <div class="mb-1">
      <p class="font-semibold text-gray-800">
        {{ title || "Project's Title" }}
      </p>
    </div>

    <div class="flex justify-between text-xs text-gray-500 mb-2">
      <p>Deadline: {{ end || "XX/XX/XXXX" }}</p>
    </div>

    <!-- Owner and Members -->
    <div
      class="flex items-start justify-start mt-3 text-gray-600 text-xs gap-4"
    >
      <!-- Owner -->
      <div class="flex flex-col items-center">
        <p class="mb-1">Owner</p>
        <img
          :src="owner"
          alt="owner"
          class="w-6 h-6 rounded-full bg-gray-300"
        />
      </div>

      <!-- Members -->
      <div class="flex flex-col">
        <p class="mb-1">Member</p>
        <div class="flex gap-1">
          <img
            v-for="(img, index) in memberImages"
            :key="index"
            :src="img"
            class="w-6 h-6 rounded-full bg-gray-300"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore.js";

const props = defineProps({
  title: String,
  status: String,
  end: String,
  owner: String,
  members: Array,
  memberImages: Array,
  projectId: Number,
  isPinned: Boolean,
  currentUserId: Number,
});

const emit = defineEmits(["toggle-pin"]);
const router = useRouter();
const userStore = useUserStore();

console.log('User from Pinia:', userStore.user);
console.log(props.title)

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = decodeURIComponent(
      atob(base64Url)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(base64);
  } catch (e) {
    console.error("Invalid token:", e);
    return null;
  }
}


function goToProjectPage() {
  const token = localStorage.getItem("token");
  const decoded = parseJwt(token);
  const currentUserId = decoded?.id;

  if (!currentUserId) {
    console.log("ไม่พบ token หรือ token ไม่ถูกต้อง");
    return;
  }

  const currentUser = props.members.find(
    (member) => member.id === currentUserId
  );

  const userPosition = currentUser?.position || "Member";

  router.push({
    path: `/member/${currentUserId}`,
    query: {
      position: userPosition,
      projectId: props.projectId,
    },
  });
}
</script>
