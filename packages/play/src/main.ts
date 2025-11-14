import { createApp } from 'vue'
import App from './App.vue'
import JonnyElement from 'jonny-element'
import 'jonny-element/dist/index.css'

// createApp(App).use(JonnyElement, { locale: zhCn }).mount('#app')
createApp(App).use(JonnyElement).mount("#app");
