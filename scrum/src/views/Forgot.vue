<template>
  <div
    class="flex items-center justify-center bg-[#F0FDF4] min-h-screen font-noto"
  >
    <div
      class="flex justify-center bg-[#F3F4F6] w-[577px] h-[630px] rounded-[26px] shadow-lg"
    >
      <div class="mt-[62px] ">
        <span class="text-[64px]">ลืมรหัสผ่าน</span>
        <div>
          <span class="text-[20px]">
            กรอกอีเมลที่ต้องการจะรีเซตรหัสผ่าน
          </span>
        </div>

        <!-- Input Email -->
        <div class="mt-[30px]">
          <span class="text-[20px]">อีเมล</span>
          <input
            v-model="email"
            type="text"
            placeholder="email address"
            class="w-full h-[40px] rounded-[10px] mt-[10px] px-2 border"
          />
        </div>

        <!-- Submit Button -->
        <div class="flex justify-center mt-[50px]">
          <button
            @click="handleSubmit"
            class="bg-[#2563EB] text-[#F9FAFB] w-[231px] h-[52px] rounded-[10px] text-[20px]"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import axios from "axios"
import Swal from "sweetalert2"
import { useRouter } from "vue-router"

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
const router = useRouter()
const email = ref("")

const handleSubmit = async () => {
  if (!email.value) {
    Swal.fire({
      icon: "warning",
      title: "Missing Email",
      text: "Please enter your email address.",
    })
    return
  }

  // ✅ ตรวจสอบว่าต้องมี @
  if (!email.value.includes("@")) {
    Swal.fire({
      icon: "error",
      title: "Invalid Email",
      text: "Email must include @",
      confirmButtonColor: "#EF4444",
    })
    return
  }

  // ✅ ความยาวระหว่าง 4-50 ตัวอักษร
  if (email.value.length < 4 || email.value.length > 50) {
    Swal.fire({
      icon: "error",
      title: "Invalid Email",
      text: "Email length must be between 4 and 50 characters",
      confirmButtonColor: "#EF4444",
    })
    return
  }

  try {
    const res = await axios.post(`${backendUrl}/api/users/forgot-password`, {
      email: email.value,
    })

    Swal.fire({
      icon: "success",
      title: "Success",
      text: res.data.message,
    })

    router.push({ path: "/verify-otp", query: { email: email.value } })
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.response?.data?.error || "Something went wrong. Try again.",
    })
  }
}
</script>
