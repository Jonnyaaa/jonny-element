import { createApp } from 'vue'
import App from './App.vue'
import JonnyElement, { zhCn } from 'jonny-element'
import 'jonny-element/dist/index.css'

createApp(App).use(JonnyElement, { locale: zhCn }).mount('#app')
