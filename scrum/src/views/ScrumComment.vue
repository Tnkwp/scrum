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
            props.data.type === 'weekly'
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
                <img src="/pdf.png" alt="" class="w-6 h-6" />
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
        <span class="text-[14px]"> Comment </span>
      </div>
      <div class="space-y-3 max-h-64 overflow-y-auto pr-2">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="flex items-start justify-between space-x-2 group"
        >
          <!-- ส่วนแสดงข้อมูล comment -->
          <div class="flex-1">
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
              <p class="text-sm text-gray-700">
                {{
                  typeof comment.comment === "string"
                    ? comment.comment
                    : JSON.stringify(comment.comment)
                }}
              </p>
            </div>
          </div>

          <!-- ปุ่ม 3 จุด -->
          <div class="relative">
            <div v-if="comment.user_id == userStore.user.id" class="relative">
              <button @click="toggleMenu(comment.id)" class="">⋮</button>

              <!-- เมนูแก้ไข/ลบ -->
              <div
                v-if="openMenuId === comment.id"
                class="absolute right-0 mt-1 w-28 bg-white border rounded shadow-md z-50"
              >
                <button
                  class="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm"
                  @click="editComment(comment)"
                >
                  ✏️ แก้ไข
                </button>
                <button
                  class="block w-full text-left px-3 py-1 hover:bg-red-100 text-sm text-red-600"
                  @click="deleteComment(comment.id)"
                >
                  🗑️ ลบ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- กล่องป้อนคอมเมนต์ -->
      <div class="flex items-center mt-2">
        <input
          v-model="newComment"
          type="text"
          :placeholder="editingCommentId ? 'แก้ไขคอมเมนต์...' : 'Sent...'"
          class="flex-1 border rounded-full px-3 py-1 text-sm"
          @keydown.enter="editingCommentId ? updateComment() : sendComment()"
        />
        <button
          @click="editingCommentId ? updateComment() : sendComment()"
          class="ml-2 text-2xl"
        >
          ➤
        </button>
        <button
          v-if="editingCommentId"
          @click="cancelEdit"
          class="ml-2 text-sm text-gray-500"
        >
          ❌
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
// import { defineProps, defineEmits } from "vue";
import axios from "axios";
import { useRoute } from "vue-router";
import { useUserStore } from "../stores/userStore.js";
import Swal from "sweetalert2";

const route = useRoute();
const comments = ref([]);
const newComment = ref("");
const token = ref(null);
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const openMenuId = ref(null);
const userStore = useUserStore();
const editingCommentId = ref(null);
const props = defineProps({
  visible: Boolean,
  data: Object,
});

// console.log("userID",userStore.user)
// console.log(dailyScrumId);
console.log("userID",props.data);

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
      comments.value = [];
    }
  } catch (err) {
    console.error("Error fetching comments:", err);
  }
}

async function sendComment() {
  token.value = localStorage.getItem("token");
  try {
    const res = await axios.post(
      `${backendUrl}/api/comments/${props.data.id}`,
      { comment: newComment.value },
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "ngrok-skip-browser-warning": "true",
        },
        withCredentials: true,
      }
    );

    // ✅ เช็คว่า response ห่อ object ไว้หรือไม่
    let createdComment = res.data.comment || res.data;

    if (!createdComment.User) {
      createdComment.User = {
        firstname: userStore.user.firstname || "You",
        lastname: userStore.user.lastname || "",
        profile_pic: userStore.user.profile_pic || null,
      };
    }

    comments.value.push({
      id: createdComment.id,
      comment: String(createdComment.comment), // ✅ ให้เป็น string แน่นอน
      User: createdComment.User,
      user_id: createdComment.user_id,
    });

    newComment.value = "";
  } catch (error) {
    console.error("Error posting comment:", error);
  }
}

onMounted(() => {
  fetchComments();
});

function toggleMenu(id) {
  openMenuId.value = openMenuId.value === id ? null : id;
}

async function editComment(comment) {
  editingCommentId.value = comment.id;
  newComment.value = comment.comment; // preload ข้อความเก่าใน input
  openMenuId.value = null;
}

async function updateComment() {
  if (!newComment.value.trim()) return;

  token.value = localStorage.getItem("token");

  try {
    await axios.put(
      `${backendUrl}/api/comments/comment/${editingCommentId.value}`,
      { comment: newComment.value },
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "ngrok-skip-browser-warning": "true",
        },
        withCredentials: true,
      }
    );

    // อัปเดตใน state
    const target = comments.value.find((c) => c.id === editingCommentId.value);
    if (target) target.comment = newComment.value;

    // reset state
    newComment.value = "";
    editingCommentId.value = null;
  } catch (err) {
    console.error("Error editing comment:", err);
  }
}

function cancelEdit() {
  newComment.value = "";
  editingCommentId.value = null;
}

async function deleteComment(id) {
  token.value = localStorage.getItem("token");

  // แสดงกล่องยืนยัน
  const result = await Swal.fire({
    title: "คุณแน่ใจหรือไม่?",
    text: "คอมเมนต์นี้จะถูกลบและไม่สามารถกู้คืนได้!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "ลบ",
    cancelButtonText: "ยกเลิก",
  });

  if (!result.isConfirmed) return;

  try {
    await axios.delete(`${backendUrl}/api/comments/comment/${id}`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        "ngrok-skip-browser-warning": "true",
      },
      withCredentials: true,
    });

    // ลบออกจาก state
    comments.value = comments.value.filter((c) => c.id !== id);
    openMenuId.value = null;

    // แจ้งเตือนสำเร็จ
    Swal.fire({
      icon: "success",
      title: "ลบสำเร็จ",
      text: "คอมเมนต์ถูกลบเรียบร้อยแล้ว",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (err) {
    console.error("Error deleting comment:", err);

    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถลบคอมเมนต์ได้ กรุณาลองใหม่อีกครั้ง",
    });
  }
}
</script>
