import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import AddDaily from "../views/AddDaily.vue";
import Info from "../views/info.vue";
import NotFound from "../views/NotFound.vue";
import EditDaily from "../views/EditDaily.vue";
import Register from "../views/register.vue";
import Forget from "../views/Forgot.vue";
import History from "../views/history.vue"
import EditProfile from "../views/EditProfile.vue";
import Homepage from "../views/Homepage.vue";
import Member from "../views/perspective/Member.vue";



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
    path: "/add-daily",
    name: "AddDaily",
    component: AddDaily,
    meta: { requiresAuth: true }, 
  },
  {
    path: "/info",
    name: "Info", 
    component: Info,
    meta: { requiresAuth: true },
  },
  {
    path: "/daily-scrum/:id",
    name: "EditDaily",
    component: EditDaily,
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
    path: "/member/:id",
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
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
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