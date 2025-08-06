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
          <p><strong>สิ่งที่ทำวันนี้</strong><br />{{ props.data.today || '-' }}</p>
          <p><strong>ปัญหาวันนี้</strong><br />{{ props.data.problem || '-' }}</p>
          <p><strong>พรุ่งนี้ทำอะไร</strong><br />{{ props.data.tomorrow || '-' }}</p>
        </div>
        <div
          v-else-if="
            props.data.type === 'friday' || props.data.type === 'retrospective'
          "
        >
          <p><strong>สิ่งที่ทำวันนี้</strong><br />{{ props.data.today || '-' }}</p>
          <p><strong>Good</strong><br />{{ props.data.good || '-' }}</p>
          <p><strong>Bad</strong><br />{{ props.data.bad || '-' }}</p>
          <p><strong>Try</strong><br />{{ props.data.try || '-' }}</p>
          <p><strong>Next Sprint</strong><br />{{ props.data.next_sprin || '-' }}</p>
        </div>
        <img
          v-if="props.data.imageUrl"
          :src="props.data.imageUrl"
          class="w-32 rounded"
        />
        <div
          v-if="props.data.fileName"
          class="flex items-center border rounded px-3 py-2 mt-2"
        >
          <svg
            class="w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 4v16m8-8H4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ props.data.fileName }}</span>
        </div>
      </div>
      <hr class="my-4" />
      <div class="flex items-center">
        <input
          v-model="comment"
          type="text"
          placeholder="Comment"
          class="flex-1 border rounded px-3 py-1"
          @keydown.enter="sendComment"
        />
        <button @click="sendComment" class="ml-2 text-2xl">➤</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  visible: Boolean,
  data: Object,
  socket: Object,
  userId: String,
});

console.log(props);

const emit = defineEmits(["close"]);

const comment = ref("");

function sendComment() {
  if (comment.value.trim() !== "") {
    props.socket.emit("newComment", {
      comment: comment.value,
      for: props.data.memberId,
      timestamp: new Date().toISOString(),
    });
    comment.value = "";
  }
}
</script>
