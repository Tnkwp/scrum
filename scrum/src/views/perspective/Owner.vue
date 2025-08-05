<template>
  <div class="min-h-screen bg-[#F0FDF4] font-noto pt-20">
    <div class="p-6">
      <div class="flex justify-between items-center text-black">
        <h1 class="text-lg font-medium">
          Project's Title: <span class="font-semibold">Project Title</span>
        </h1>
        <p>DATE : XX/XX/XXXX</p>
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
                <div class="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div class="font-semibold">Firstname Lastname</div>
              </div>
              <span class="bg-gray-200 text-xs px-3 py-1 rounded-full">
                {{ member.role }}
              </span>
            </div>
            <p><strong>สิ่งที่ทำวันนี้</strong><br />{{ member.today }}</p>
            <p><strong>ปัญหา</strong><br />{{ member.problem }}</p>
            <p><strong>พรุ่งนี้จะทำอะไร</strong><br />{{ member.tomorrow }}</p>
          </div>
        </div>

        <ScrumPopup
          v-if="showPopupp"
          :visible="showPopup"
          :data="selectedMember"
          :socket="socket"
          :user-id="userId"
          @close="showPopup = false"
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
                    <li v-for="(p, i) in submitted" :key="'submitted-' + i">
                      - {{ p.name }} ({{ p.role }})
                    </li>
                  </ul>
                </div>

                <p class="font-bold mt-4">คนที่ยังไม่ได้ส่ง</p>
                <ul class="ml-4 text-sm space-y-1">
                  <li v-for="(p, i) in notSubmitted" :key="'not-' + i">
                    - {{ p.name }} ({{ p.role }})
                  </li>
                </ul>
              </div>

              <div class="mt-4 text-sm">
                <p><strong>Sprint:</strong> 1</p>
                <p><strong>Deadline Date:</strong> XX/XX/XXXX</p>
              </div>
            </div>
          </div>

          <div class="space-y-4 mt-6">
            <button
              @click="showPopup = true"
              class="w-full bg-white text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-50"
            >
              Edit Project
            </button>
            <button
              class="w-full bg-white text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-50"
            >
              Mark Project as done
            </button>
          </div>
        </div>
      </div>
    </div>

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

            <!-- Date -->
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
              placeholder=""
            />
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Good</label
            >
            <textarea
              v-model="formData.sprintGoal"
              class="w-full border rounded px-3 py-2 h-20"
              placeholder=""
            />
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Bad</label
            >
            <textarea
              v-model="formData.sprintGoal"
              class="w-full border rounded px-3 py-2 h-20"
              placeholder=""
            />
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Try</label
            >
            <textarea
              v-model="formData.sprintGoal"
              class="w-full border rounded px-3 py-2 h-20"
              placeholder=""
            />
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Next Sprint</label
            >
            <textarea
              v-model="formData.sprintGoal"
              class="w-full border rounded px-3 py-2 h-20"
              placeholder=""
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
              placeholder=""
            />
            <label class="block text-sm font-medium text-gray-700 mb-1 mt-2"
              >Bad</label
            >
            <textarea
              v-model="formData.bad"
              class="w-full border rounded px-3 py-2 h-20"
              placeholder=""
            />
            <label class="block text-sm font-medium text-gray-700 mb-1 mt-2"
              >Try</label
            >
            <textarea
              v-model="formData.bad"
              class="w-full border rounded px-3 py-2 h-20"
              placeholder=""
            />
          </div>

          <!-- Buttons -->
          <div class="flex justify-end">
            <div class="flex gap-2">
              <button
                @click="handleCancel"
                class="flex-1 bg-[#D1FAE5] text-black py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                @click="handleSubmit"
                class="flex-1 bg-[#10B981] text-[#1F2937] py-2 px-4 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import io from 'socket.io-client';
import ScrumPopup from '../ScrumPopup.vue';
import { useRoute } from "vue-router";

const showPopup = ref(false);
const route = useRoute();
const position = route.query.position;

console.log("ตำแหน่งที่รับมา:", position);

const scrumMemberss = ref([
  {
    role: 'BA',
    today: 'ถาม Requirements จากลูกค้า',
    problem: '-',
    tomorrow: 'จัดการ Requirements ที่ได้จากลูกค้า',
    imageUrl: 'https://i.imgur.com/LfBRqgI.png',
    fileName: 'file.pdf',
    memberId: 'ba01',
  },
  // เพิ่มสมาชิกอื่น ๆ ตามต้องการ
]);

const selectedMember = ref(null);
const showPopupp = ref(false);
const userId = 'user123';
const socket = io('http://localhost:3000');

const openPopup = (member) => {
  selectedMember.value = member;
  showPopupp.value = true;
};

onMounted(() => {
  socket.on('commentBroadcast', (data) => {
    console.log('New comment:', data);
    // อาจเพิ่ม comment เข้า list หรือแสดงใน UI
  });
});

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

const scrumMembers = [
  {
    role: "BA",
    today: "ตาม Requirements จากลูกค้า",
    problem: "ปัญหาไม่มี",
    tomorrow: "จัดการ Requirements ที่ได้จากลูกค้า",
  },
  {
    role: "Back-end",
    today: "ทำ Schema",
    problem: "ปัญหาไม่มี",
    tomorrow: "วางโครงสร้าง Database",
  },
  {
    role: "UX/UI",
    today: "ออกแบบหน้าบ้าน Home",
    problem: "ปัญหาไม่มี",
    tomorrow: "ออกแบบหน้าบ้านต่อ",
  },
];

const submitted = [
  { name: "Firstname Lastname", role: "BA" },
  { name: "Firstname Lastname", role: "UX/UI" },
  { name: "Firstname Lastname", role: "Back-end" },
  { name: "Firstname Lastname", role: "Front-end" },
];

const notSubmitted = [
  { name: "Firstname Lastname", role: "Back-end" },
  { name: "Firstname Lastname", role: "SA" },
  { name: "Firstname Lastname", role: "Front-end" },
];

const handleSubmit = () => {
  console.log("Form submitted:", { ...formData.value });
  showPopup.value = false;
  resetForm();
};

const handleCancel = () => {
  showPopup.value = false;
  resetForm();
};

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


</script>

<style scoped>
</style>
