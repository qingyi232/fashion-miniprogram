<template>
  <div id="app">
    <Navbar />
    <main class="main-content">
      <router-view />
    </main>
    <TabBar v-if="!isAdmin" />

    <div v-if="showAnnouncement && currentAnn" class="ann-overlay" @click.self="showAnnouncement = false">
      <div class="ann-popup">
        <button class="ann-close" @click="showAnnouncement = false">✕</button>
        <div class="ann-icon">📢</div>
        <h3>{{ currentAnn.title }}</h3>
        <p>{{ currentAnn.content }}</p>
        <button class="btn btn-primary" style="width:100%;margin-top:16px" @click="showAnnouncement = false">我知道了</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import TabBar from './components/TabBar.vue'
import { getActiveAnnouncements } from './api'

const route = useRoute()
const isAdmin = computed(() => route.path.startsWith('/admin'))

const showAnnouncement = ref(false)
const currentAnn = ref(null)

onMounted(async () => {
  try {
    const res = await getActiveAnnouncements()
    if (res.code === 200 && res.data?.length) {
      const lastSeen = localStorage.getItem('ann_seen')
      const latest = res.data[0]
      if (!lastSeen || lastSeen !== String(latest.id)) {
        currentAnn.value = latest
        showAnnouncement.value = true
        localStorage.setItem('ann_seen', String(latest.id))
      }
    }
  } catch {}
})
</script>

<style>
:root {
  --bg: #f7f8f9;
  --bg2: #ffffff;
  --card: #ffffff;
  --text: #1a1a2e;
  --text2: #6b7280;
  --text3: #9ca3af;
  --accent: #e07a5f;
  --accent-light: #fef0ec;
  --accent-dark: #c4583c;
  --pink: #f2a6b3;
  --pink-light: #fdf2f4;
  --green: #6db884;
  --green-light: #edf7f0;
  --red: #e45858;
  --border: #eef0f2;
  --shadow: 0 1px 8px rgba(0,0,0,0.04), 0 2px 16px rgba(0,0,0,0.03);
  --shadow-lg: 0 4px 24px rgba(0,0,0,0.07);
  --radius: 14px;
  --radius-lg: 22px;
  --warm: #f5e6d0;
  --warm-light: #faf5ef;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', 'Microsoft YaHei', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; -webkit-font-smoothing: antialiased; letter-spacing: 0.2px; }
a { text-decoration: none; color: inherit; }
button { cursor: pointer; font-family: inherit; }
input, select, textarea { font-family: inherit; }

.main-content { padding-bottom: 80px; min-height: calc(100vh - 60px); }

.container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }

.page-header { padding: 32px 0 24px; }
.page-header h1 { font-size: 24px; font-weight: 700; color: var(--text); letter-spacing: 0.5px; }
.page-header p { font-size: 14px; color: var(--text2); margin-top: 6px; }

.card { background: var(--card); border-radius: var(--radius); box-shadow: var(--shadow); border: 1px solid var(--border); transition: box-shadow 0.3s, transform 0.3s; }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; border: none; transition: all 0.25s; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-dark); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(224,122,95,0.3); }
.btn-outline { background: transparent; border: 1.5px solid var(--accent); color: var(--accent); }
.btn-outline:hover { background: var(--accent-light); }
.btn-ghost { background: var(--bg); color: var(--text2); border: 1px solid var(--border); }
.btn-ghost:hover { background: #f0ece6; }
.btn-sm { padding: 6px 14px; font-size: 12px; border-radius: 6px; }
.btn-danger { background: var(--red); color: #fff; }
.btn-danger:hover { opacity: 0.9; }

.tag { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; background: var(--accent-light); color: var(--accent-dark); font-weight: 500; }

.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 13px; color: var(--text2); margin-bottom: 6px; font-weight: 500; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1.5px solid var(--border); background: var(--bg); color: var(--text); font-size: 14px; outline: none; transition: border-color 0.2s; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--accent); }
.form-group input::placeholder, .form-group textarea::placeholder { color: var(--text3); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(4px); }
.modal { background: var(--card); border-radius: var(--radius-lg); width: 92%; max-width: 520px; padding: 32px; box-shadow: var(--shadow-lg); }
.modal h2 { font-size: 20px; margin-bottom: 20px; color: var(--text); }
.modal-actions { display: flex; gap: 12px; margin-top: 24px; }
.modal-actions .btn { flex: 1; }

.empty-state { text-align: center; padding: 60px 20px; color: var(--text2); }
.empty-state .icon { font-size: 48px; margin-bottom: 16px; opacity: 0.6; }
.empty-state p { font-size: 14px; }

.toast { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); padding: 12px 24px; border-radius: 8px; background: var(--text); color: #fff; font-size: 14px; z-index: 300; box-shadow: var(--shadow-lg); }

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

@media (max-width: 768px) {
  .grid-3, .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .form-row { grid-template-columns: 1fr; }
  .container { padding: 0 16px; }
}
@media (max-width: 480px) {
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
}

.ann-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 300; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(4px); }
.ann-popup { background: var(--card); border-radius: var(--radius-lg); padding: 36px 32px; max-width: 400px; width: 90%; text-align: center; box-shadow: var(--shadow-lg); position: relative; }
.ann-close { position: absolute; top: 12px; right: 14px; background: none; border: none; font-size: 18px; color: var(--text3); cursor: pointer; }
.ann-icon { font-size: 40px; margin-bottom: 12px; }
.ann-popup h3 { font-size: 18px; font-weight: 700; margin-bottom: 10px; color: var(--text); }
.ann-popup p { font-size: 14px; color: var(--text2); line-height: 1.7; }
</style>
