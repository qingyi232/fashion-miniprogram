<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-brand">👗 衣搭管理</div>
      <nav class="sidebar-nav">
        <router-link to="/admin" class="nav-item" exact-active-class="active">📊 数据概览</router-link>
        <router-link to="/admin/users" class="nav-item" active-class="active">👥 用户管理</router-link>
        <router-link to="/admin/reviews" class="nav-item" active-class="active">📋 内容审核</router-link>
        <router-link to="/admin/system" class="nav-item" active-class="active">⚙️ 系统管理</router-link>
        <router-link to="/" class="nav-item">🏠 返回前台</router-link>
      </nav>
    </aside>
    <main class="admin-main">
      <h1>数据概览</h1>
      <div class="admin-stats">
        <div class="a-stat-card"><div class="a-stat-icon" style="background:var(--accent-light);color:var(--accent-dark)">👥</div><div><div class="a-stat-num">{{ stats.totalUsers }}</div><div class="a-stat-label">注册用户</div></div></div>
        <div class="a-stat-card"><div class="a-stat-icon" style="background:var(--pink-light);color:var(--pink)">👚</div><div><div class="a-stat-num">{{ stats.totalClothes }}</div><div class="a-stat-label">衣物总量</div></div></div>
        <div class="a-stat-card"><div class="a-stat-icon" style="background:var(--green-light);color:var(--green)">✨</div><div><div class="a-stat-num">{{ stats.totalOutfits }}</div><div class="a-stat-label">搭配方案</div></div></div>
        <div class="a-stat-card"><div class="a-stat-icon" style="background:#eef0ff;color:#6c7ae0">📸</div><div><div class="a-stat-num">{{ stats.totalShares }}</div><div class="a-stat-label">穿搭分享</div></div></div>
        <div class="a-stat-card"><div class="a-stat-icon" style="background:#fff3e6;color:#e6a23c">📋</div><div><div class="a-stat-num">{{ stats.pendingReviews }}</div><div class="a-stat-label">待审核</div></div></div>
        <div class="a-stat-card"><div class="a-stat-icon" style="background:#fde8e8;color:var(--red)">💬</div><div><div class="a-stat-num">{{ stats.pendingFeedbacks }}</div><div class="a-stat-label">待处理反馈</div></div></div>
      </div>

      <h2 style="margin-top:32px;margin-bottom:16px;font-size:18px">最近注册用户</h2>
      <div class="admin-table card">
        <table>
          <thead><tr><th>头像</th><th>昵称</th><th>性别</th><th>注册时间</th></tr></thead>
          <tbody>
            <tr v-for="u in stats.recentUsers" :key="u.id">
              <td><img :src="u.avatar" class="table-avatar"></td>
              <td>{{ u.nickname }}</td>
              <td>{{ u.gender || '-' }}</td>
              <td>{{ u.created_at?.substring(0,10) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAdminStats } from '../../api'

const stats = ref({})

onMounted(async () => {
  const res = await getAdminStats()
  if (res.code === 200) stats.value = res.data
})
</script>

<style scoped>
.admin-layout { display: flex; min-height: 100vh; }
.admin-sidebar { width: 220px; background: #2c2c2c; padding: 24px 0; flex-shrink: 0; position: sticky; top: 60px; height: calc(100vh - 60px); }
.sidebar-brand { color: var(--accent); font-size: 18px; font-weight: 700; padding: 0 24px 24px; border-bottom: 1px solid #3a3a3a; }
.sidebar-nav { padding: 16px 0; display: flex; flex-direction: column; }
.nav-item { padding: 12px 24px; color: #aaa; font-size: 14px; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
.nav-item:hover, .nav-item.active { color: #fff; background: rgba(255,255,255,0.08); }
.nav-item.active { border-right: 3px solid var(--accent); }

.admin-main { flex: 1; padding: 32px 40px; background: var(--bg); }
.admin-main h1 { font-size: 24px; font-weight: 700; margin-bottom: 24px; }

.admin-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.a-stat-card { display: flex; align-items: center; gap: 16px; background: var(--card); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); border: 1px solid var(--border); }
.a-stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
.a-stat-num { font-size: 24px; font-weight: 700; color: var(--text); }
.a-stat-label { font-size: 13px; color: var(--text2); }

.admin-table { overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 12px 16px; font-size: 13px; color: var(--text2); font-weight: 500; border-bottom: 1px solid var(--border); background: var(--bg); }
td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #f5f5f5; }
.table-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
</style>
