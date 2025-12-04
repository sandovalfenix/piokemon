import '@/assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Feature 007: Import PC Box store for initialization
import { usePCBoxStore } from '@/stores/pcBox'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

// Feature 007: Load PC Box from localStorage on app initialization
const pcBoxStore = usePCBoxStore()
pcBoxStore.initialize()
console.log(`[main.ts] PC Box loaded with ${pcBoxStore.boxCount} Pokémon`)

app.mount('#app')
