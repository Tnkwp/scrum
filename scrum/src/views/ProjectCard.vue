<template>
  <div
    class="rounded-xl p-4 shadow-md relative text-sm cursor-pointer"
    :class="[isMember ? 'bg-white' : 'bg-gray-200 opacity-60']"
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
        v-if="isPinned?.value"
        src="/push-pinn.png"
        alt="Pinned"
        class="w-6 h-6"
      />
      <img v-else src="/push-pin.png" alt="Unpinned" class="w-6 h-6" />
    </button>

    <!-- Title and basic info -->
    <div @click="goToProjectPage">
      <div class="mb-1 mt-3">
        <p
          class="font-semibold text-gray-800 truncate w-full"
          title="{{ title }}"
        >
          {{ title || "Project's Title" }}
        </p>
      </div>

      <div class="flex justify-between text-xs text-gray-500 mb-2">
        <p>Deadline: {{ end || "XX/XX/XXXX" }}</p>
      </div>
    </div>

    <!-- Owner and Members -->
    <div
      class="flex items-start justify-start mt-3 text-gray-600 text-xs gap-4"
    >
      <!-- Owner -->
      <div class="flex flex-col items-center relative group">
        <p class="mb-1">Owner</p>
        <img
          :src="owner.profile_pic || '/user.png'"
          alt="owner"
          class="w-6 h-6 rounded-full bg-gray-300 object-cover cursor-pointer"
        />

        <!-- Hover popup -->
        <div
          class="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block bg-black border border-gray-300 rounded shadow-lg p-2 text-xs z-10 min-w-[100px] text-center text-white"
        >
          <div class="flex gap-1 justify-center">
            <div>
              {{ owner.firstname }}
            </div>
            <div>
              {{ owner.lastname }}
            </div>
          </div>
        </div>
      </div>

      <!-- Members -->
      <div class="flex flex-col relative">
        <p class="mb-1">Member</p>
        <div class="flex items-center gap-1">
          <!-- แสดงแค่ 3 รูปแรก -->
          <div
            v-for="member in memberImages.slice(0, 3)"
            :key="member.firstname + member.lastname"
            class="relative group"
          >
            <img
              :src="member.profile_pic || '/user.png'"
              class="w-6 h-6 rounded-full bg-gray-300 object-cover cursor-pointer"
            />

            <!-- Tooltip hover แสดงชื่อ -->
            <div
              class="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block bg-black border border-gray-300 rounded shadow-lg p-2 text-xs z-10 min-w-[100px] text-center text-white"
            >
              <div class="flex gap-1 justify-center">
                <div>
                  {{ member.firstname }}
                </div>
                <div>
                  {{ member.lastname }}
                </div>
              </div>
            </div>
          </div>

          <!-- ถ้าเกิน 3 คน ให้มี +N -->
          <div
            v-if="memberImages.length > 3"
            class="relative group w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700 cursor-pointer"
          >
            +{{ memberImages.length - 3 }}

            <!-- Tooltip hover แสดงสมาชิกที่เหลือ -->
            <div
              class="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block bg-black border border-gray-300 rounded shadow-lg p-2 text-xs z-10 min-w-[140px] text-white"
            >
              <ul>
                <li
                  v-for="member in memberImages.slice(3)"
                  :key="member.firstname + member.lastname"
                >
                  {{ member.firstname }} {{ member.lastname }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from "vue";
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore.js";
import { computed } from "vue";

const emit = defineEmits(["toggle-pin"]);
const router = useRouter();
const userStore = useUserStore();
const token = localStorage.getItem("token");
const decoded = parseJwt(token);
const currentUserId = decoded?.id;

const props = defineProps({
  project: Object,
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

const showAll = ref(false);

console.log(props);

const isMember = computed(() =>
  props.project.members.some((member) => member.id === currentUserId)
);

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

  // ✅ เก็บข้อมูลไว้ใน localStorage
  localStorage.setItem(
    "projectInfo",
    JSON.stringify({
      position: userPosition,
      projectId: props.projectId,
    })
  );

  // ✅ ไปแค่ path เฉย ๆ
  router.push(`/project/${props.projectId}`);
}
</script>
