<template>
  <div class="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
    <div
      class="bg-white rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden"
    >
      <!-- ปุ่มปิด -->
      <button
        class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
        @click="emit('close')"
      >
        ✕
      </button>

      <!-- เนื้อหา -->
      <div class="p-6 space-y-4 text-sm">
        <!-- Daily / Weekly -->
        <div v-if="props.data.type === 'daily'" class="">
          <div>
            <span class="font-semibold text-gray-800">สิ่งที่ทำวันนี้:</span>
            <div>
              <span class="text-gray-600"> {{ props.data.today || "-" }}</span>
            </div>
          </div>

          <div>
            <span class="font-semibold text-gray-800">ปัญหาวันนี้:</span>
            <div>
              <span class="text-gray-600">
                {{ props.data.problem || "-" }}</span
              >
            </div>
          </div>
          <div>
            <span class="font-semibold text-gray-800">พรุ่งนี้ทำอะไร:</span>
            <div>
              <span class="text-gray-600">
                {{ props.data.tomorrow || "-" }}</span
              >
            </div>
          </div>
        </div>

        <div v-else-if="props.data.type === 'weekly'" class="space-y-3">
          <p>
            <span class="font-semibold">สิ่งที่ทำวันนี้:</span>
            {{ props.data.today || "-" }}
          </p>
          <p>
            <span class="font-semibold text-green-600">Good:</span>
            {{ props.data.good || "-" }}
          </p>
          <p>
            <span class="font-semibold text-red-600">Bad:</span>
            {{ props.data.bad || "-" }}
          </p>
          <p>
            <span class="font-semibold text-blue-600">Try:</span>
            {{ props.data.try || "-" }}
          </p>
          <p>
            <span class="font-semibold text-purple-600">Next Sprint:</span>
            {{ props.data.next_sprint || "-" }}
          </p>
        </div>

        <!-- ไฟล์แนบ -->
        <div v-if="props.data.file?.length" class="space-y-2">
          <p class="text-sm font-semibold text-gray-700">ไฟล์แนบ:</p>
          <div v-for="(f, index) in props.data.file" :key="index">
            <img
              v-if="f.mime_type?.startsWith('image')"
              :src="f.file_url"
              class="w-32 rounded-lg shadow-sm border"
            />
            <div
              v-else
              class="flex items-center gap-2 border rounded-lg px-3 py-2 hover:bg-gray-50 transition"
            >
              <img
                v-if="f.file_name.endsWith('.pdf')"
                src="/pdf.png"
                class="w-6 h-6"
              />
              <img
                v-else-if="
                  f.file_name.endsWith('.doc') || f.file_name.endsWith('.docx')
                "
                src="/doc.png"
                class="w-6 h-6"
              />
              <img
                v-else-if="
                  f.file_name.endsWith('.xls') || f.file_name.endsWith('.xlsx')
                "
                src="/xls.png"
                class="w-6 h-6"
              />
              <img
                v-else-if="
                  f.file_name.endsWith('.ppt') || f.file_name.endsWith('.pptx')
                "
                src="/ppt.png"
                class="w-6 h-6"
              />
              <!-- <img v-else src="/file.png" class="w-6 h-6" /> -->
              <span class="text-sm text-gray-700">{{ f.file_name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- คอมเมนต์ -->
      <div class="border-t px-6 py-3">
        <span class="text-sm font-semibold text-gray-700">💬 Comments</span>
      </div>

      <div
        class="px-6 space-y-4 max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pb-4"
      >
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="group flex items-start gap-2"
        >
          <img
            :src="comment.User?.profile_pic || '/user.png'"
            class="w-8 h-8 rounded-full"
          />
          <div class="flex-1 bg-gray-50 rounded-lg px-3 py-2">
            <p class="text-sm font-semibold">
              {{ comment.User?.firstname }} {{ comment.User?.lastname }}
            </p>
            <p class="text-sm text-gray-700">{{ comment.comment }}</p>
          </div>

          <!-- เมนู 3 จุด -->
          <div class="relative" v-if="comment.user_id == userStore.user.id">
            <button
              @click="toggleMenu(comment.id)"
              class="transition text-gray-500 hover:text-gray-700"
            >
              ⋮
            </button>
            <div
              v-if="openMenuId === comment.id"
              class="absolute right-3 top-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
            >
              <!-- ปุ่มแก้ไข -->
              <button
                @click="editComment(comment)"
                class="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition border-b"
              >
                <img src="/edit.png" alt="edit" class="w-5 h-5 opacity-80" />
                <span>แก้ไขข้อความ</span>
              </button>

              <!-- ปุ่มลบ -->
              <button
                @click="deleteComment(comment.id)"
                class="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <img
                  src="/delete.png"
                  alt="delete"
                  class="w-5 h-5 opacity-80"
                />
                <span>ลบข้อความ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- กล่องป้อนคอมเมนต์ -->
      <div class="border-t mt-2 px-6 py-3 flex items-center gap-2">
        <input
          v-model="newComment"
          type="text"
          :placeholder="editingCommentId ? 'คอมเมนต์...' : 'คอมเมนต์...'"
          class="flex-1 border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          @keydown.enter="editingCommentId ? updateComment() : sendComment()"
        />
        <button
          @click="editingCommentId ? updateComment() : sendComment()"
          class="text-black px-2 text-[25px]"
        >
          ➤
        </button>
        <button
          v-if="editingCommentId"
          @click="cancelEdit"
          class="text-sm text-gray-500 hover:text-gray-700"
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
console.log("userID", props.data);

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
