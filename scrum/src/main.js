import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router";
import { createPinia } from "pinia";
import GoogleLogin from "vue3-google-login";
import PrimeVue from 'primevue/config'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App);

app.use(ElementPlus)
app.use(PrimeVue)
app.use(createPinia());
app.use(router);
app.use(GoogleLogin, {
  clientId:
    "",
});
app.mount("#app");
