import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/register.vue";
import Forget from "../views/Forgot.vue";
import History from "../views/history.vue"
import EditProfile from "../views/EditProfile.vue";
import Homepage from "../views/Homepage.vue";
import Member from "../views/perspective/Member.vue";
import Notification from "../views/notification.vue";
import VerifyOTP from "../views/VerifyOTP.vue";
import RePassword from "../views/RePassword.vue";

const routes = [
  {
    path: "/",
    name: "Login",
    component: Login,
  },
  {
    path: "/homepage",
    name: "Homepage",
    component: Homepage,
    meta: { requiresAuth: true }, 
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/forgot-password",
    name: "Forget",
    component: Forget,
  },
  {
    path: "/verify-otp",
    name: "VerifyOTP",
    component: VerifyOTP,
  },
  {
    path: "/re-password",
    name: "RePassword",
    component: RePassword,
  },
  {
    path: "/project/:id",
    name: "Member",
    component: Member,
  },
  {
    path: "/history/:id",
    name: "History",
    component: History,
  },
  {
    path: "/editprofile",
    name: "EditProfile",
    component: EditProfile,
  },
  {
    path: "/all-notifications",
    name: "Notification",
    component: Notification,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    try {
      return { top: 0, behavior: "smooth" };
    } catch {
      return { top: 0 };
    }
  },
});


// router.beforeEach((to, from, next) => {
//   const isAuthenticated = !!localStorage.getItem("token");

//   if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
//     next({ name: "Login" });
//   } else if (to.name === "Login" && isAuthenticated) {
//     next({ name: "DailyList" });
//   } else {
//     next();
//   }
// });

export default router;