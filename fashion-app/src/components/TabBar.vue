<template>
  <div class="tabbar">
    <router-link to="/" class="tab-item" :class="{ active: route.path === '/' }">
      <span class="tab-icon">🏠</span><span>首页</span>
    </router-link>
    <router-link to="/wardrobe" class="tab-item" :class="{ active: route.path === '/wardrobe' }">
      <span class="tab-icon">👚</span><span>衣橱</span>
    </router-link>
    <router-link to="/match" class="tab-item tab-center" :class="{ active: route.path === '/match' }">
      <span class="tab-icon-main">✨</span><span>搭配</span>
    </router-link>
    <router-link to="/share" class="tab-item" :class="{ active: route.path.startsWith('/share') }">
      <span class="tab-icon">📸</span><span>广场</span>
    </router-link>
    <router-link to="/profile" class="tab-item" :class="{ active: route.path === '/profile' || route.path === '/stats' }">
      <span class="tab-icon">👤</span><span>我的</span>
    </router-link>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<style scoped>
.tabbar { position: fixed; bottom: 0; left: 0; right: 0; height: 68px; background: rgba(255,255,255,0.96); backdrop-filter: blur(16px); border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-around; z-index: 100; padding-bottom: env(safe-area-inset-bottom); }
.tab-item { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 10px; color: var(--text3); text-decoration: none; transition: color 0.2s; padding: 4px 12px; }
.tab-item.active { color: var(--accent-dark); }
.tab-icon { font-size: 22px; }
.tab-center { position: relative; margin-top: -16px; }
.tab-icon-main { font-size: 26px; width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--accent), var(--accent-dark)); border-radius: 50%; box-shadow: 0 4px 16px rgba(224,122,95,0.3); }
.tab-center.active .tab-icon-main { box-shadow: 0 6px 20px rgba(224,122,95,0.45); }
</style>
