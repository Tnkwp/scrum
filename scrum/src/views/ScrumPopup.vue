<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
  >
    <div class="bg-white rounded-lg p-6 w-full max-w-md relative">
      <button class="absolute top-2 right-2 text-xl" @click="emit('close')">
        ×
      </button>
      <div class="space-y-2 text-sm">
        <div v-if="props.data.type === 'daily'">
          <p>
            <strong>สิ่งที่ทำวันนี้</strong><br />{{ props.data.today || "-" }}
          </p>
          <p>
            <strong>ปัญหาวันนี้</strong><br />{{ props.data.problem || "-" }}
          </p>
          <p>
            <strong>พรุ่งนี้ทำอะไร</strong><br />{{
              props.data.tomorrow || "-"
            }}
          </p>
        </div>
        <div
          v-else-if="
            props.data.type === 'friday' || props.data.type === 'retrospective'
          "
        >
          <p>
            <strong>สิ่งที่ทำวันนี้</strong><br />{{ props.data.today || "-" }}
          </p>
          <p><strong>Good</strong><br />{{ props.data.good || "-" }}</p>
          <p><strong>Bad</strong><br />{{ props.data.bad || "-" }}</p>
          <p><strong>Try</strong><br />{{ props.data.try || "-" }}</p>
          <p>
            <strong>Next Sprint</strong><br />{{
              props.data.next_sprint || "-"
            }}
          </p>
        </div>
        <div v-if="props.data.file && props.data.file.length > 0">
          <div v-for="(f, index) in props.data.file" :key="index" class="mt-2">
            <!-- รูปภาพ -->
            <img
              v-if="f.mime_type?.startsWith('image')"
              :src="f.file_url"
              class="w-32 rounded mb-1"
            />

            <!-- ไฟล์เอกสารอื่น ๆ -->
            <div v-else class="flex items-center border rounded px-3 py-2">
              <!-- PDF -->
              <template
                v-if="
                  f.mime_type === 'application/pdf' ||
                  f.file_name.toLowerCase().endsWith('.pdf')
                "
              >
                <img src="/file.png" alt="" class="w-6 h-6" />
              </template>

              <!-- Word -->
              <template
                v-else-if="
                  f.mime_type.includes('wordprocessingml') ||
                  f.mime_type === 'application/msword' ||
                  f.file_name.toLowerCase().endsWith('.doc') ||
                  f.file_name.toLowerCase().endsWith('.docx')
                "
              >
                <img src="/doc.png" alt="" class="w-6 h-6" />
              </template>

              <!-- Excel -->
              <template
                v-else-if="
                  f.mime_type.includes('spreadsheetml') ||
                  f.file_name.toLowerCase().endsWith('.xls') ||
                  f.file_name.toLowerCase().endsWith('.xlsx')
                "
              >
                <img src="/xls.png" alt="" class="w-6 h-6" />
              </template>

              <!-- PowerPoint -->
              <template
                v-else-if="
                  f.mime_type.includes('presentationml') ||
                  f.file_name.toLowerCase().endsWith('.ppt') ||
                  f.file_name.toLowerCase().endsWith('.pptx')
                "
              >
                <img src="/ppt.png" alt="" class="w-6 h-6" />
              </template>

              <!-- Text -->
              <template
                v-else-if="
                  f.mime_type === 'text/plain' ||
                  f.file_name.toLowerCase().endsWith('.txt')
                "
              >
                <img src="/txt-file.png" alt="" class="w-6 h-6" />
              </template>

              <!-- Default ไฟล์อื่นๆ -->
              <template v-else>
                <svg
                  class="w-6 h-6 mr-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </template>

              <span>{{ f.file_name }}</span>
            </div>
          </div>
        </div>
      </div>
      <hr class="my-2" />
      <div>
        <span class="text-[14px]"> Commment </span>
      </div>
      <div class="space-y-3 max-h-64 overflow-y-auto pr-2">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="flex items-start space-x-2"
        >
          <div>
            <div class="flex gap-2 items-center">
              <img
                :src="comment.User?.profile_pic || '/user.png'"
                class="w-6 h-6 rounded-full"
                alt="profile"
              />
              <p class="text-sm font-semibold">
                {{ comment.User?.firstname }} {{ comment.User?.lastname }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-700">{{ comment.comment }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- กล่องป้อนคอมเมนต์ -->
      <div class="flex items-center mt-2">
        <input
          v-model="newComment"
          type="text"
          placeholder="Sent..."
          class="flex-1 border rounded-full px-3 py-1 text-sm"
          @keydown.enter="sendComment"
        />
        <button @click="sendComment" class="ml-2 text-2xl">➤</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { defineProps, defineEmits } from "vue";
import axios from "axios";
import { useRoute } from "vue-router";

const route = useRoute();
const dailyScrumId = route.params.id;
const comments = ref([]);
const newComment = ref("");
const token = ref(null);
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const props = defineProps({
  visible: Boolean,
  data: Object,
  socket: Object,
  userId: String,
});

console.log(dailyScrumId);
console.log(props.data.id);

const emit = defineEmits(["close"]);

async function fetchComments() {
  token.value = localStorage.getItem("token");
  try {
    const res = await axios.get(`${backendUrl}/api/comments/${props.data.id}`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        "ngrok-skip-browser-warning": "true",
      },
      withCredentials: true,
    });

    if (Array.isArray(res.data.comments)) {
      comments.value = res.data.comments;
    } else {
      comments.value = []; // fallback
    }
  } catch (err) {
    console.error("Error fetching comments:", err);
  }
}

async function sendComment() {
  token.value = localStorage.getItem("token");
  try {
    const res = await axios.post(`${backendUrl}/api/comments/${props.data.id}`, {
      comment: newComment.value
    }, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        "ngrok-skip-browser-warning": "true",
      },
      withCredentials: true,
    });

    let createdComment = res.data;

    // 🔒 Fallback ถ้า User ไม่ถูกส่งกลับมา
    if (!createdComment.User) {
      createdComment.User = {
        firstname: "You",
        lastname: "",
        profile_pic: null,
      };
    }

    if (!Array.isArray(comments.value)) {
      comments.value = [];
    }

    comments.value.push(createdComment);
    newComment.value = "";
  } catch (error) {
    console.error("Error posting comment:", error);
  }
}

onMounted(() => {
  fetchComments();
});
</script>
