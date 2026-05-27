<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <router-link to="/" class="logo">
        <span class="logo-icon">👗</span>
        <span class="logo-text">衣搭</span>
      </router-link>
      <div class="nav-links">
        <router-link to="/">首页</router-link>
        <router-link to="/wardrobe">衣橱</router-link>
        <router-link to="/match">智能搭配</router-link>
        <router-link to="/share">穿搭广场</router-link>
        <router-link to="/stats">数据分析</router-link>
      </div>
      <div class="nav-right">
        <router-link v-if="user.state.isLoggedIn && user.state.user?.role === 'admin'" to="/admin" class="admin-link">管理后台</router-link>
        <router-link v-if="user.state.isLoggedIn" to="/profile" class="avatar-link">
          <img :src="user.state.user?.avatar || ''" class="nav-avatar">
          <span>{{ user.state.user?.nickname }}</span>
        </router-link>
        <router-link v-else to="/login" class="btn btn-primary btn-sm">登录</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useUser } from '../stores/user'
const user = useUser()
</script>

<style scoped>
.navbar { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.88); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(0,0,0,0.04); }
.navbar-inner { max-width: 1100px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; height: 64px; }
.logo { display: flex; align-items: center; gap: 10px; }
.logo-icon { font-size: 26px; }
.logo-text { font-size: 21px; font-weight: 800; color: var(--accent); letter-spacing: 3px; }
.nav-links { display: flex; gap: 32px; }
.nav-links a { font-size: 14px; color: var(--text2); font-weight: 500; transition: all 0.25s; padding: 6px 0; border-bottom: 2px solid transparent; }
.nav-links a:hover { color: var(--text); }
.nav-links a.router-link-active { color: var(--accent); border-bottom-color: var(--accent); }
.nav-right { display: flex; align-items: center; gap: 16px; }
.avatar-link { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text2); font-weight: 500; }
.nav-avatar { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-light); }
.admin-link { font-size: 12px; padding: 5px 14px; border-radius: 6px; background: var(--green-light); color: var(--green); font-weight: 600; }
@media (max-width: 768px) { .nav-links { display: none; } }
</style>
