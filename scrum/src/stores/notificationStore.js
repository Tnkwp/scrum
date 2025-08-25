import { defineStore } from "pinia";

export const useNotificationStore = defineStore("notification", {
  state: () => ({
    user_id: null,
    daily_scrum_id: null,
  }),
  actions: {
    setUserId(id) {
      this.user_id = id;
    },
    setDailyScrumId(id) {
      this.daily_scrum_id = id;
    },
    clear() {
      this.user_id = null;
      this.daily_scrum_id = null;
    },
  },
});
