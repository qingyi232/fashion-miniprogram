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
      <h1>内容审核</h1>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div class="review-tabs">
          <button :class="['tab-btn', { active: tab === '' }]" @click="tab=''; load()">全部</button>
          <button :class="['tab-btn', { active: tab === 'pending' }]" @click="tab='pending'; load()">待审核</button>
          <button :class="['tab-btn', { active: tab === 'approved' }]" @click="tab='approved'; load()">已通过</button>
          <button :class="['tab-btn', { active: tab === 'rejected' }]" @click="tab='rejected'; load()">已拒绝</button>
        </div>
        <button v-if="selectedIds.length" class="btn btn-sm btn-danger" @click="batchDel">🗑️ 批量删除（{{ selectedIds.length }}）</button>
      </div>
      <div class="review-list">
        <div v-for="s in shares" :key="s._id || s.id" class="review-item card">
          <div class="review-header">
            <label class="check-wrap" @click.stop>
              <input type="checkbox" :value="s._id || s.id" v-model="selectedIds">
            </label>
            <img :src="s.avatar" class="review-avatar">
            <div class="review-user-info">
              <span class="review-name">{{ s.nickname }}</span>
              <span class="review-time">{{ s.created_at?.substring(0,16) }}</span>
            </div>
            <span class="status-badge" :class="s.status">{{ statusLabel(s.status) }}</span>
          </div>
          <p class="review-content">{{ s.content }}</p>
          <img v-if="s.images" :src="s.images" class="review-img" alt="">
          <div class="review-tags">
            <span v-for="t in (s.style_tags || '').split(',')" :key="t" class="tag">{{ t }}</span>
          </div>
          <div class="review-stats">
            <span>❤️ {{ s.likes_count }}</span>
            <span>💬 {{ s.comments_count }}</span>
            <span>⭐ {{ s.collects_count }}</span>
          </div>
          <div class="review-actions" v-if="s.status === 'pending'">
            <button class="btn btn-sm btn-primary" @click="approve(s._id || s.id)">通过</button>
            <button class="btn btn-sm btn-danger" @click="reject(s._id || s.id)">驳回</button>
          </div>
          <div class="review-actions" v-else-if="s.status === 'approved'">
            <button class="btn btn-sm btn-danger" @click="reject(s._id || s.id)">下架</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAdminReviews, updateReview, batchDeleteReviews } from '../../api'

const shares = ref([])
const tab = ref('')
const selectedIds = ref([])

function statusLabel(s) {
  return { pending: '待审核', approved: '已通过', rejected: '已拒绝' }[s] || s
}

async function load() {
  const params = {}
  if (tab.value) params.status = tab.value
  const res = await getAdminReviews(params)
  if (res.code === 200) shares.value = res.data
  selectedIds.value = []
}

async function approve(id) { await updateReview(id, 'approved'); load() }
async function reject(id) { await updateReview(id, 'rejected'); load() }

async function batchDel() {
  if (confirm(`确定删除选中的 ${selectedIds.value.length} 条违规内容吗？`)) {
    await batchDeleteReviews(selectedIds.value)
    load()
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
.admin-main h1 { font-size: 24px; font-weight: 700; margin-bottom: 16px; }

.review-tabs { display: flex; gap: 8px; margin-bottom: 24px; }
.tab-btn { padding: 8px 20px; border-radius: 20px; font-size: 13px; border: 1.5px solid var(--border); background: var(--card); color: var(--text2); cursor: pointer; transition: all 0.2s; }
.tab-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }

.review-list { display: flex; flex-direction: column; gap: 16px; }
.review-item { padding: 20px; }
.review-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.review-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
.review-user-info { flex: 1; }
.review-name { display: block; font-size: 14px; font-weight: 600; }
.review-time { font-size: 12px; color: var(--text3); }
.status-badge { padding: 4px 12px; border-radius: 10px; font-size: 12px; font-weight: 500; }
.status-badge.approved { background: var(--green-light); color: var(--green); }
.status-badge.pending { background: #fff3e6; color: #e6a23c; }
.status-badge.rejected { background: #fde8e8; color: var(--red); }
.review-content { font-size: 14px; color: var(--text); line-height: 1.6; margin-bottom: 12px; }
.review-img { width: 200px; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 12px; }
.review-tags { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
.review-stats { display: flex; gap: 14px; font-size: 12px; color: var(--text3); margin-bottom: 12px; }
.review-actions { display: flex; gap: 8px; }
.check-wrap { display: flex; align-items: center; cursor: pointer; }
.check-wrap input { width: 18px; height: 18px; accent-color: var(--accent); cursor: pointer; }
</style>
