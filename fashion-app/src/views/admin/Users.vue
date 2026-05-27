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
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <div>
          <h1>用户管理</h1>
          <p style="color:var(--text2);margin-top:4px">共 {{ users.length }} 位注册用户</p>
        </div>
        <button class="btn btn-outline btn-sm" @click="doExport">📥 导出用户数据</button>
      </div>
      <div class="admin-table card">
        <table>
          <thead><tr><th>头像</th><th>昵称</th><th>性别</th><th>手机号</th><th>衣物数</th><th>分享数</th><th>状态</th><th>注册时间</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td><img :src="u.avatar" class="table-avatar"></td>
              <td>{{ u.nickname }}</td>
              <td>{{ u.gender || '-' }}</td>
              <td>{{ u.phone || '-' }}</td>
              <td>{{ u.clothesCount }}</td>
              <td>{{ u.sharesCount }}</td>
              <td><span class="status-badge" :class="u.status">{{ u.status === 'active' ? '正常' : '禁用' }}</span></td>
              <td>{{ u.created_at?.substring(0,10) }}</td>
              <td>
                <button v-if="u.status === 'active'" class="btn btn-sm btn-ghost" style="color:var(--red)" @click="toggleStatus(u.id, 'disabled')">禁用</button>
                <button v-else class="btn btn-sm btn-primary" @click="toggleStatus(u.id, 'active')">启用</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAdminUsers, updateUserStatus, exportUsers } from '../../api'

const users = ref([])

async function load() {
  const res = await getAdminUsers()
  if (res.code === 200) users.value = res.data
}

async function toggleStatus(id, status) {
  if (confirm(status === 'disabled' ? '确定禁用该用户吗？' : '确定启用该用户吗？')) {
    await updateUserStatus(id, status)
    load()
  }
}

async function doExport() {
  const res = await exportUsers()
  if (res.code === 200) {
    const headers = ['ID', '昵称', '性别', '手机号', '衣物数', '搭配数', '分享数', '状态', '注册时间']
    const rows = res.data.map(u => [u.id, u.nickname, u.gender || '', u.phone || '', u.clothesCount, u.outfitsCount, u.sharesCount, u.status, u.created_at?.substring(0, 10)])
    const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `用户数据_${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }
}

onMounted(load)
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
.admin-main h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
.admin-table { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 12px 16px; font-size: 13px; color: var(--text2); font-weight: 500; border-bottom: 1px solid var(--border); background: var(--bg); white-space: nowrap; }
td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #f5f5f5; white-space: nowrap; }
.table-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.status-badge { padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 500; }
.status-badge.active { background: var(--green-light); color: var(--green); }
</style>
