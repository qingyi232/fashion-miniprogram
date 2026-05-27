<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <span class="brand-icon">👗</span>
        <h1>衣搭</h1>
        <p>智能穿搭助手 · 发现你的风格</p>
      </div>
      <div class="login-form">
        <h2>选择身份登录</h2>
        <div class="user-list">
          <div v-for="u in users" :key="u.openid" class="user-option" @click="doLogin(u.openid)">
            <img :src="u.avatar" class="user-avatar">
            <div class="user-info">
              <span class="user-name">{{ u.name }}</span>
              <span class="user-role">{{ u.roleLabel }}</span>
            </div>
            <span class="arrow">›</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { login } from '../api'
import { useUser } from '../stores/user'

const router = useRouter()
const user = useUser()

const users = [
  { openid: 'wx_user_001', name: '林小鹿', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face', roleLabel: '普通用户 · 时尚达人' },
  { openid: 'wx_user_002', name: '陈一帆', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', roleLabel: '普通用户 · 极简主义' },
  { openid: 'wx_user_003', name: '苏晚晴', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', roleLabel: '普通用户 · 日系博主' },
  { openid: 'wx_user_004', name: '周子墨', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', roleLabel: '普通用户 · 街头潮流' },
  { openid: 'wx_user_005', name: '沈悦然', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face', roleLabel: '普通用户 · 法式穿搭' },
  { openid: 'wx_admin_001', name: '管理员', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', roleLabel: '系统管理员' },
]

async function doLogin(openid) {
  const res = await login(openid)
  if (res.code === 200) {
    user.setUser(res.data)
    router.push(res.data.role === 'admin' ? '/admin' : '/')
  }
}
</script>

<style scoped>
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(165deg, #f7f8f9 0%, #fef0ec 50%, #edf7f0 100%); padding: 20px; position: relative; overflow: hidden; }
.login-page::before { content: ''; position: absolute; top: -20%; left: -10%; width: 400px; height: 400px; border-radius: 50%; background: rgba(242,166,179,0.08); }
.login-page::after { content: ''; position: absolute; bottom: -15%; right: -8%; width: 350px; height: 350px; border-radius: 50%; background: rgba(109,184,132,0.06); }
.login-card { width: 100%; max-width: 430px; position: relative; z-index: 1; }
.login-brand { text-align: center; margin-bottom: 44px; }
.brand-icon { font-size: 60px; display: block; margin-bottom: 14px; }
.login-brand h1 { font-size: 34px; font-weight: 800; color: var(--accent); letter-spacing: 5px; }
.login-brand p { font-size: 14px; color: var(--text2); margin-top: 10px; letter-spacing: 1px; }
.login-form { background: var(--card); border-radius: var(--radius-lg); padding: 36px; box-shadow: 0 8px 40px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.04); }
.login-form h2 { font-size: 15px; color: var(--text2); margin-bottom: 22px; text-align: center; font-weight: 500; }
.user-list { display: flex; flex-direction: column; gap: 10px; }
.user-option { display: flex; align-items: center; gap: 14px; padding: 14px 18px; border-radius: var(--radius); border: 1.5px solid var(--border); cursor: pointer; transition: all 0.25s; }
.user-option:hover { border-color: var(--accent); background: var(--accent-light); transform: translateX(6px); }
.user-avatar { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border); }
.user-info { flex: 1; }
.user-name { display: block; font-size: 15px; font-weight: 600; color: var(--text); }
.user-role { display: block; font-size: 12px; color: var(--text3); margin-top: 3px; }
.arrow { font-size: 22px; color: var(--text3); transition: color 0.2s; }
.user-option:hover .arrow { color: var(--accent); }
</style>
