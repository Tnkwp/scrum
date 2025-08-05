<template>
  <div v-if="user" class="user-info">
    <h2>Welcome, {{ user.username }}</h2>
    <img :src="user.profilePic" alt="Profile Picture" class="profile-pic" />
    <p><strong>Email:</strong> {{ user.email }}</p>
  </div>

  <div v-else>
    <p>Loading user info...</p>
  </div>
</template>

<script setup>

import { onMounted, ref } from 'vue'
import axios from 'axios'

const user = ref(null)

onMounted(async () => {
  try {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    console.log('Making request to:', BACKEND_URL); // Debug log

    const token = localStorage.getItem("token");
    
    // If there's no token, handle it here (e.g., show an alert or redirect)
    if (!token) {
      console.error("No token found. Please log in.");
      return;
    }

    const response = await axios.get(`${BACKEND_URL}/api/user/info`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': "true"
      },
      withCredentials: true
    });

    console.log('Response:', response); // Full response log
    user.value = response.data.info;
    
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
  }
});
</script>