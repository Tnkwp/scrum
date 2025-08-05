import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const user = ref(null);
  const token = ref(null);

  const setUser = (userData) => {
  user.value = userData;
  localStorage.setItem('user', JSON.stringify(userData));
};
  const setToken = (newToken) => {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  };

  const clearAuth = () => {
  user.value = null;
  token.value = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

  return { user, token, setUser, setToken, clearAuth };
});
