<template>
  <div class="min-h-screen flex items-center justify-center bg-[#F0FDF4]">
    <span
      class="absolute top-8 left-1/2 transform -translate-x-1/2 text-5xl font-noto text-white drop-shadow-md"
      >Daily Scrum</span
    >
    <div
      class="w-full max-w-md bg-white rounded-lg shadow-xl p-10 flex flex-col items-center"
    >
      <div class="flex justify-center mb-12">
        <label class="text-5xl font-noto">Login</label>
      </div>
      <div class="flex flex-col w-full gap-2 font-noto">
        <label>Email</label>
        <input
          type="text"
          v-model="email"
          class="border-gray-200 rounded-md p-2 placeholder-gray-400 focus:outline-none"
          placeholder="email"
          autocomplete="email"
        />
      </div>
      <div class="flex flex-col w-full mt-6 gap-2 font-noto">
        <label>Password</label>
        <input
          type="password"
          v-model="password"
          class="border-gray-200 rounded-md p-2 placeholder-gray-400 focus:outline-none"
          placeholder="password"
          autocomplete="current-password"
        />
      </div>
      <div class="flex justify-end w-full">
        <router-link to="/forgot-password">
          <button>
            <span class="text-[12px] font-noto">forgot password</span>
          </button>
        </router-link>
      </div>
      <div class="flex justify-center w-full mt-8">
        <button
          @click="login"
          class="bg-[#ADEED9] w-full text-white px-4 py-2 rounded hover:bg-[#56DFCF] transition"
        >
          Login
        </button>
      </div>

      <!-- Divider: OR -->
      <div class="flex items-center my-6 w-full">
        <div class="flex-grow border-t border-gray-300"></div>
        <span class="mx-4 text-gray-500 text-[12px]">Or Login with</span>
        <div class="flex-grow border-t border-gray-300"></div>
      </div>

      <div class="flex justify-center w-full">
        <button
          @click="loginWithGoogle"
          class="border text-black px-4 py-2 rounded transition flex gap-2 items-center justify-center"
        >
          <img src="/google.png" alt="" class="w-[20px] h-[20px]" />
          <span class="text-[14px] font-bold font-noto">Google</span>
        </button>
      </div>
      <div class="flex justify-center w-full mt-4 text-[12px] gap-2 font-noto">
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

async function login() {
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
      confirmButtonColor: "#56DFCF",
    });

    if (localStorage.getItem("token")){
      localStorage.removeItem("token")
      localStorage.setItem("token", res.data.token);
    } else {
      localStorage.setItem("token", res.data.token);
    }


    router.push("/homepage");
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Login Failed",
      text: error.response?.data?.msg || "Login failed",
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
