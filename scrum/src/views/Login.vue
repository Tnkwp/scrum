<template>
  <div class="min-h-screen flex items-center justify-center bg-[#F0FDF4] px-4">
    <!-- Header -->
    <span
      class="absolute top-8 left-1/2 transform -translate-x-1/2 text-3xl sm:text-5xl font-noto text-black drop-shadow-md"
    >
      Daily Log
    </span>

    <!-- Login Card -->
    <div
      class="w-full max-w-md sm:max-w-lg bg-white rounded-lg shadow-xl p-6 sm:p-10 flex flex-col items-center"
    >
      <!-- Title -->
      <div class="flex justify-center mb-8 sm:mb-12">
        <label class="text-3xl sm:text-5xl font-noto">Login</label>
      </div>

      <!-- Email -->
      <div class="flex flex-col w-full gap-2 font-noto">
        <label class="text-sm sm:text-base">Email</label>
        <input
          type="text"
          v-model="email"
          class="border border-gray-200 rounded-md p-2 sm:p-3 placeholder-gray-400 focus:outline-none"
          placeholder="email"
          autocomplete="email"
        />
      </div>

      <!-- Password -->
      <div class="flex flex-col w-full mt-4 sm:mt-6 gap-2 font-noto">
        <label class="text-sm sm:text-base">Password</label>
        <input
          type="password"
          v-model="password"
          class="border border-gray-200 rounded-md p-2 sm:p-3 placeholder-gray-400 focus:outline-none"
          placeholder="password"
          autocomplete="current-password"
        />
      </div>

      <!-- Forgot Password -->
      <div class="flex justify-end w-full mt-2">
        <router-link to="/forgot-password">
          <button>
            <span class="text-[10px] sm:text-[12px] font-noto">forgot password</span>
          </button>
        </router-link>
      </div>

      <!-- Login Button -->
      <div class="flex justify-center w-full mt-6 sm:mt-8">
        <button
          @click="login"
          class="bg-[#ADEED9] w-full text-white px-4 py-2 sm:py-3 rounded hover:bg-[#56DFCF] transition text-sm sm:text-base"
        >
          Login
        </button>
      </div>

      <!-- Divider: OR -->
      <div class="flex items-center my-4 sm:my-6 w-full">
        <div class="flex-grow border-t border-gray-300"></div>
        <span class="mx-2 sm:mx-4 text-gray-500 text-[10px] sm:text-[12px]">Or Login with</span>
        <div class="flex-grow border-t border-gray-300"></div>
      </div>

      <!-- Google Login -->
      <div class="flex justify-center w-full">
        <button
          @click="loginWithGoogle"
          class="border text-black px-4 py-2 sm:py-3 rounded transition flex gap-2 items-center justify-center text-sm sm:text-base"
        >
          <img src="/google.png" alt="Google" class="w-5 h-5 sm:w-6 sm:h-6" />
          <span class="font-bold font-noto">Google</span>
        </button>
      </div>

      <!-- Register -->
      <div class="flex  sm:flex-row justify-center w-full mt-4 text-[10px] gap-1 sm:gap-2 font-noto">
        <label>Don't have an account?</label>
        <router-link to="/register">
          <button class="font-bold">Register Now</button>
        </router-link>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";

const router = useRouter();
const email = ref("");
const password = ref("");

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function validateEmailAndPassword() {
  // email must include @
  if (!email.value.includes("@")) {
    Swal.fire({
      icon: "error",
      title: "Invalid Email",
      text: "email must include @",
      confirmButtonColor: "#EF4444",
    });
    return false;
  }

  // email length 4-50
  if (email.value.length < 4 || email.value.length > 50) {
    Swal.fire({
      icon: "error",
      title: "Invalid Email",
      text: "character in username need to be 4-50 letters",
      confirmButtonColor: "#EF4444",
    });
    return false;
  }

  // password length >= 8
  if (password.value.length < 8) {
    Swal.fire({
      icon: "error",
      title: "Invalid Password",
      text: "Password must be at least 8 characters long",
      confirmButtonColor: "#EF4444",
    });
    return false;
  }

  // password length <= 50
  if (password.value.length > 50) {
    Swal.fire({
      icon: "error",
      title: "Invalid Password",
      text: "Password cannot exceed 50 characters",
      confirmButtonColor: "#EF4444",
    });
    return false;
  }

  return true;
}

async function login() {
  // ตรวจสอบ validation ก่อน
  if (!validateEmailAndPassword()) return;

  try {
    const res = await axios.post(
      `${backendUrl}/api/users/login`,
      {
        email: email.value,
        password: password.value,
      },
      {
        withCredentials: true,
      }
    );

    await Swal.fire({
      icon: "success",
      title: "Login Success",
      text: res.data.msg,
      width: "400px",
      confirmButtonColor: "#56DFCF",
    });

    // เก็บ token
    localStorage.setItem("token", res.data.token);

    router.push("/homepage");
  } catch (error) {
    // แสดงข้อความจาก backend หรือ User not found
    Swal.fire({
      icon: "error",
      title: "Login Failed",
      text: error.response?.data?.msg || "User not found",
      confirmButtonColor: "#EF4444",
    });
    console.error("Login error:", error);
  }
}


function loginWithGoogle() {
  const redirectState = encodeURIComponent(window.location.origin);
  window.location.href = `${backendUrl}/auth/google?state=${redirectState}&ngrok-skip-browser-warning=true`;
}
</script>
