<template>
  <div
    class="flex items-center justify-center bg-[#F0FDF4] min-h-screen font-noto"
  >
    <div
      class="flex justify-center bg-[#F3F4F6] w-[577px] h-[500px] rounded-[26px] shadow-lg"
    >
      <div class="mt-[62px] w-[450px] text-center">
        <span class="text-[48px]">Verify OTP</span>
        <div class="mt-2 text-[18px] text-gray-700">
          <p>
            Please enter the OTP code sent to your email
            <span class="font-semibold text-blue-600">{{ email }}</span>
          </p>
        </div>

        <!-- OTP Inputs -->
        <div class="mt-[30px] flex justify-between">
          <input
            v-for="(value, index) in otpArray"
            :key="index"
            v-model="otpArray[index]"
            type="text"
            maxlength="1"
            class="w-[66px] h-[70px] text-center text-[24px] rounded-[10px] border"
            @input="onInput(index, $event)"
            @keydown.backspace="onBackspace(index, $event)"
            ref="otpRefs"
          />
        </div>

        <!-- Resend OTP -->
        <div class="mt-2">
          <button
            @click="handleResend"
            class="text-blue-600 underline text-[16px]"
          >
            Resend OTP
          </button>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-center mt-[40px]">
          <button
            @click="handleVerify"
            class="bg-[#2563EB] text-[#F9FAFB] w-[231px] h-[52px] rounded-[10px] text-[20px]"
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const route = useRoute();
const router = useRouter();

const email = ref(route.query.email || "");

// ใช้ array สำหรับเก็บ OTP แต่ละช่อง
const otpArray = ref(["", "", "", "", "", ""]);
const otpRefs = ref([]);

// ฟังก์ชันรวมค่า OTP เป็น string
const otp = () => otpArray.value.join("");

// เมื่อ input แต่ละช่อง
const onInput = (index, event) => {
  const value = event.target.value;
  otpArray.value[index] = value.replace(/[^0-9]/g, ""); // กรองเฉพาะตัวเลข
  if (value && index < otpArray.value.length - 1) {
    // focus ช่องถัดไป
    nextTick(() => otpRefs.value[index + 1].focus());
  }
};

// backspace จะกลับไปช่องก่อนหน้า
const onBackspace = (index, event) => {
  if (!otpArray.value[index] && index > 0) {
    nextTick(() => otpRefs.value[index - 1].focus());
  }
};

// ✅ Verify OTP
const handleVerify = async () => {
  if (otp().length < 6) {
    Swal.fire({
      icon: "warning",
      title: "Missing OTP",
      text: "Please enter the OTP code.",
    });
    return;
  }

  try {
    // ส่ง OTP ไป backend
    const res = await axios.post(`${backendUrl}/api/users/verify-otp`, {
      otp: otp(),
    });

    const token = res.data.token; // รับ token จาก response

    // เก็บ token ใน localStorage
    localStorage.setItem("resetToken", token);

    await Swal.fire({
      icon: "success",
      title: "OTP Verified",
      text: res.data.message || "OTP verified successfully!",
    });

    // ไปหน้า reset password โดยไม่ส่ง token ใน URL
    router.push({ path: "/re-password" });
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Invalid OTP",
      text: err.response?.data?.error || "OTP is incorrect or expired.",
    });
  }
};


// ✅ Resend OTP
const handleResend = async () => {
  try {
    const res = await axios.post(`${backendUrl}/api/users/resend-otp`, {
      email: email.value,
    });
    Swal.fire({
      icon: "success",
      title: "OTP Resent",
      text: res.data.message || "New OTP has been sent to your email.",
    });
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.response?.data?.error || "Failed to resend OTP.",
    });
  }
};
</script>
