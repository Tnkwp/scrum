<template>
  <div
    class="flex items-center justify-center bg-[#F0FDF4] min-h-screen font-noto"
  >
    <div
      class="flex justify-center bg-[#F3F4F6] w-[577px] h-[550px] rounded-[26px] shadow-lg"
    >
      <div class="mt-[62px] w-[450px]">
        <h1 class="text-[48px] text-center">Reset Password</h1>
        <p class="text-center text-[18px] text-gray-600 mt-2">
          Please enter your new password for
          <span class="font-semibold text-blue-600">{{ email }}</span>
        </p>

        <!-- New Password -->
        <div class="mt-[30px]">
          <label class="text-[20px]">New Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="Enter new password"
            class="w-full h-[45px] rounded-[10px] mt-[10px] px-2 border"
          />
        </div>

        <!-- Confirm Password -->
        <div class="mt-[20px]">
          <label class="text-[20px]">Confirm Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            class="w-full h-[45px] rounded-[10px] mt-[10px] px-2 border"
          />
        </div>

        <!-- Submit Button -->
        <div class="flex justify-center mt-[40px]">
          <button
            @click="handleReset"
            class="bg-[#2563EB] text-[#F9FAFB] w-[231px] h-[52px] rounded-[10px] text-[20px]"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import axios from "axios"
import Swal from "sweetalert2"

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
const router = useRouter()

const password = ref("")
const confirmPassword = ref("")

// ✅ Reset Password
const handleReset = async () => {
  if (!password.value || !confirmPassword.value) {
    Swal.fire({
      icon: "warning",
      title: "Missing Fields",
      text: "Please fill in all password fields.",
    })
    return
  }

  if (password.value !== confirmPassword.value) {
    Swal.fire({
      icon: "error",
      title: "Password Mismatch",
      text: "Passwords do not match. Please try again.",
    })
    return
  }

  try {
    // ✅ ดึง token จาก localStorage (เก็บไว้หลัง verify OTP สำเร็จ)
    const token = localStorage.getItem("resetToken")
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "No Token",
        text: "Reset token is missing. Please verify OTP again.",
      })
      return
    }

    const res = await axios.post(`${backendUrl}/api/users/reset-password`, {
      token,
      newPassword: password.value,
    })

    await Swal.fire({
      icon: "success",
      title: "Password Reset",
      text: res.data.message || "Your password has been reset successfully.",
    })

    // เคลียร์ token ออก
    localStorage.removeItem("resetToken")

    // ✅ กลับไปหน้า Login
    router.push('/')
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.response?.data?.error || "Failed to reset password.",
    })
  }
}
</script>

