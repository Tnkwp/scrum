import { defineStore } from "pinia";

export const useNotificationStore = defineStore("notification", {
  state: () => ({
    user_id: null,
    post_id: null,
  }),
  actions: {
    setUserId(id) {
      this.user_id = id;
    },
    setDailyScrumId(id) {
      this.post_id = id;
    },
    clear() {
      this.user_id = null;
      this.post_id = null;
    },
  },
});
