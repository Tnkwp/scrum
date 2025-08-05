<template>
    <div class="min-h-screen bg-white p-6 font-noto pt-20">
      <!-- Back button -->
      <div class="mb-4">
        <button @click="goBack" class="text-red-500 text-xl">◀</button>
      </div>
  
      <form @submit.prevent="handleSubmit" class="space-y-4 max-w-3xl mx-auto">
        <div class="w-1/4">
          <Datepicker v-model="form.createdAt" format="dd/MM/yyyy" />
        </div>
        <!-- Daily Scrum -->
        <div>
          <label class="block font-noto font-semibold mb-1"
            >Daily-scrum สิ่งที่ทำวันนี้</label
          >
          <textarea
            v-model="form.daily"
            class="w-full border p-2 rounded"
            rows="3"
          ></textarea>
        </div>
  
        <!-- Properties -->
        <div>
          <label class="block font-noto font-semibold mb-1"
            >Properties สกิลที่ใช้ในการทำงาน</label
          >
          <input
            v-model="form.properties"
            class="w-full border p-2 rounded focus:outline-none"
          />
        </div>
  
        <!-- Problem -->
        <div>
          <label class="block font-noto font-semibold mb-1"
            >Problem ปัญหาที่พบ</label
          >
          <textarea
            v-model="form.problem"
            class="w-full border p-2 rounded"
            rows="3"
          ></textarea>
        </div>
  
        <!-- Todo -->
        <div>
          <label class="block font-noto font-semibold mb-1"
            >Todo พรุ่งนี้จะทำอะไร</label
          >
          <textarea
            v-model="form.todo"
            class="w-full border p-2 rounded"
            rows="3"
          ></textarea>
        </div>
  
        <!-- File upload -->
        <div>
          <div class="flex items-center justify-center w-full">
            <label
              for="files"
              class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div class="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span class="font-semibold">Click to upload</span> or drag and
                  drop
                </p>
              </div>
              <input
                id="files"
                type="file"
                multiple
                class="hidden"
                @change="handleFileChange"
              />
            </label>
          </div>
  
          <div v-if="selectedFiles.length" class="mt-4 text-sm text-gray-700">
            <ul class="list-disc list-inside">
              <li v-for="(file, index) in selectedFiles" :key="index">
                {{ file.name }}
              </li>
            </ul>
          </div>
        </div>
  
        <!-- Buttons -->
        <div class="flex justify-center space-x-4 mt-6 font-noto">
          <button
            type="button"
            @click="handleCancel"
            class="bg-red-500 px-4 py-2 rounded text-white"
          >
            ยกเลิก
          </button>
          <button type="submit" class="bg-green-600 px-4 py-2 rounded">
            โพส
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import Datepicker from "@vuepic/vue-datepicker";
  
  const router = useRouter()
  const route = useRoute()
  
  const form = ref({
    createdAt: '',
    daily: '',
    properties: '',
    problem: '',
    todo: '',
    // เพิ่ม fields อื่นๆ ถ้ามี
  })
  const selectedFiles = ref([])
  
  // โหลดข้อมูล scrum เดิม
  onMounted(async () => {
    const id = route.params.id
    try {
      const res = await fetch(`/api/daily-scrum/${id}`)
      const data = await res.json()
      form.value = {
        createdAt: data.createdAt,
        daily: data.daily,
        properties: data.properties,
        problem: data.problem,
        todo: data.todo,
        // เพิ่ม fields อื่นๆ ถ้ามี
      }
    } catch (e) {
      alert('ไม่พบข้อมูล')
      router.back()
    }
  })
  
  function handleFileChange(event) {
    selectedFiles.value = Array.from(event.target.files)
  }
  
  function goBack() {
    router.back()
  }
  
  function handleCancel() {
    router.back()
  }
  
  async function handleSubmit() {
    const id = route.params.id
    const formData = new FormData()
    Object.entries(form.value).forEach(([k, v]) => {
      formData.append(k, v)
    })
    // แนบไฟล์ (ถ้ามี)
    selectedFiles.value.forEach((file) => {
      formData.append('files', file)
    })
    try {
      const res = await fetch(`/api/daily-scrum/${id}`, {
        method: 'PUT',
        body: formData,
      })
      if (!res.ok) throw new Error('Update failed')
      alert('อัปเดตข้อมูลสำเร็จ')
      router.push('/somewhere') // เปลี่ยน path ตามต้องการ
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการอัปเดต')
    }
  }
  </script>
  
  <style scoped>
  /* Optional additional styling */
  </style>