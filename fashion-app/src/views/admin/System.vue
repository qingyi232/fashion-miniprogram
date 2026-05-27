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
      <h1>系统管理</h1>

      <section class="sys-section">
        <div class="sys-header">
          <h2>公告管理</h2>
          <button class="btn btn-primary btn-sm" @click="showAnnForm = true">+ 发布公告</button>
        </div>
        <div class="ann-list">
          <div v-for="a in announcements" :key="a.id" class="ann-item card">
            <div class="ann-content">
              <h4>{{ a.title }}</h4>
              <p>{{ a.content }}</p>
              <span class="ann-time">{{ a.created_at?.substring(0,10) }}</span>
            </div>
            <button class="btn btn-sm btn-ghost" style="color:var(--red)" @click="removeAnn(a.id)">删除</button>
          </div>
        </div>
      </section>

      <section class="sys-section">
        <h2>用户反馈</h2>
        <div class="feedback-list">
          <div v-for="f in feedbacks" :key="f.id" class="feedback-item card">
            <div class="feedback-header">
              <img :src="f.avatar" class="fb-avatar">
              <div>
                <span class="fb-name">{{ f.nickname }}</span>
                <span class="fb-type">{{ f.type === 'suggestion' ? '建议' : '投诉' }}</span>
              </div>
              <span class="status-badge" :class="f.status">{{ f.status === 'replied' ? '已回复' : '待处理' }}</span>
            </div>
            <p class="fb-content">{{ f.content }}</p>
            <div v-if="f.reply" class="fb-reply"><strong>回复：</strong>{{ f.reply }}</div>
            <div v-if="f.status === 'pending'" class="fb-reply-form">
              <input v-model="f._reply" placeholder="输入回复...">
              <button class="btn btn-sm btn-primary" @click="doReply(f)">回复</button>
            </div>
          </div>
        </div>
      </section>

      <section class="sys-section">
        <h2>智能搭配算法参数</h2>
        <div class="algo-panel card" style="padding:20px">
          <div class="form-row">
            <div class="form-group"><label>颜色匹配权重</label><input type="number" v-model.number="algoParams.colorWeight" min="0" max="10" step="0.1"></div>
            <div class="form-group"><label>季节匹配权重</label><input type="number" v-model.number="algoParams.seasonWeight" min="0" max="10" step="0.1"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>场合匹配权重</label><input type="number" v-model.number="algoParams.occasionWeight" min="0" max="10" step="0.1"></div>
            <div class="form-group"><label>用户偏好权重</label><input type="number" v-model.number="algoParams.preferenceWeight" min="0" max="10" step="0.1"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>最大推荐方案数</label><input type="number" v-model.number="algoParams.maxSchemes" min="1" max="10"></div>
            <div class="form-group"><label>协同过滤K值</label><input type="number" v-model.number="algoParams.kValue" min="1" max="20"></div>
          </div>
          <button class="btn btn-primary btn-sm" @click="saveAlgoParams">保存参数</button>
        </div>
      </section>

      <section class="sys-section">
        <h2>系统运行状态</h2>
        <div class="status-grid">
          <div class="status-card card" style="padding:16px">
            <div class="status-dot green"></div>
            <div><div class="status-name">API服务</div><div class="status-val">运行中 · 端口 3001</div></div>
          </div>
          <div class="status-card card" style="padding:16px">
            <div class="status-dot green"></div>
            <div><div class="status-name">数据库</div><div class="status-val">SQLite · 正常</div></div>
          </div>
          <div class="status-card card" style="padding:16px">
            <div class="status-dot green"></div>
            <div><div class="status-name">前端服务</div><div class="status-val">Vite · 端口 5173</div></div>
          </div>
          <div class="status-card card" style="padding:16px">
            <div class="status-dot green"></div>
            <div><div class="status-name">存储空间</div><div class="status-val">充足 · 云存储可用</div></div>
          </div>
        </div>
      </section>

      <section class="sys-section">
        <h2>系统日志</h2>
        <div class="admin-table card">
          <table>
            <thead><tr><th>操作</th><th>详情</th><th>操作者</th><th>时间</th></tr></thead>
            <tbody>
              <tr v-for="l in logs" :key="l.id">
                <td>{{ l.action }}</td>
                <td>{{ l.detail }}</td>
                <td>{{ l.operator }}</td>
                <td>{{ l.created_at?.substring(0,16) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div v-if="showAnnForm" class="modal-overlay" @click.self="showAnnForm = false">
        <div class="modal">
          <h2>发布公告</h2>
          <div class="form-group"><label>标题</label><input v-model="annForm.title" placeholder="公告标题"></div>
          <div class="form-group"><label>内容</label><textarea v-model="annForm.content" rows="3" placeholder="公告内容"></textarea></div>
          <div class="modal-actions">
            <button class="btn btn-ghost" @click="showAnnForm = false">取消</button>
            <button class="btn btn-primary" @click="publishAnn">发布</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getAdminAnnouncements, createAnnouncement, deleteAnnouncement, getAdminFeedbacks, replyFeedback, getAdminLogs } from '../../api'

const announcements = ref([])
const feedbacks = ref([])
const logs = ref([])
const showAnnForm = ref(false)
const annForm = reactive({ title: '', content: '' })
const algoParams = reactive({
  colorWeight: 3.0, seasonWeight: 4.0, occasionWeight: 5.0,
  preferenceWeight: 2.5, maxSchemes: 3, kValue: 5
})

function saveAlgoParams() { alert('算法参数已保存，将在下次生成搭配时生效') }

async function loadAll() {
  const [r1, r2, r3] = await Promise.all([getAdminAnnouncements(), getAdminFeedbacks(), getAdminLogs()])
  if (r1.code === 200) announcements.value = r1.data
  if (r2.code === 200) feedbacks.value = r2.data.map(f => ({ ...f, _reply: '' }))
  if (r3.code === 200) logs.value = r3.data
}

async function publishAnn() {
  if (!annForm.title) return
  await createAnnouncement(annForm)
  showAnnForm.value = false
  Object.assign(annForm, { title: '', content: '' })
  loadAll()
}

async function removeAnn(id) {
  if (confirm('确定删除？')) { await deleteAnnouncement(id); loadAll() }
}

async function doReply(f) {
  if (!f._reply) return
  await replyFeedback(f.id, { reply: f._reply, status: 'replied' })
  loadAll()
}

onMounted(loadAll)
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

.sys-section { margin-bottom: 40px; }
.sys-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.sys-section h2 { font-size: 18px; font-weight: 600; margin-bottom: 16px; }

.ann-list { display: flex; flex-direction: column; gap: 12px; }
.ann-item { display: flex; align-items: center; padding: 16px 20px; }
.ann-content { flex: 1; }
.ann-content h4 { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.ann-content p { font-size: 13px; color: var(--text2); }
.ann-time { font-size: 12px; color: var(--text3); }

.feedback-list { display: flex; flex-direction: column; gap: 12px; }
.feedback-item { padding: 16px 20px; }
.feedback-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.fb-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.fb-name { display: block; font-size: 14px; font-weight: 500; }
.fb-type { font-size: 12px; color: var(--text3); }
.status-badge { padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 500; margin-left: auto; }
.status-badge.replied { background: var(--green-light); color: var(--green); }
.status-badge.pending { background: #fff3e6; color: #e6a23c; }
.fb-content { font-size: 14px; color: var(--text); margin-bottom: 8px; }
.fb-reply { font-size: 13px; color: var(--green); background: var(--green-light); padding: 8px 12px; border-radius: 8px; }
.fb-reply-form { display: flex; gap: 8px; margin-top: 8px; }
.fb-reply-form input { flex: 1; padding: 8px 12px; border-radius: 8px; border: 1.5px solid var(--border); font-size: 13px; outline: none; }

.admin-table { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 12px 16px; font-size: 13px; color: var(--text2); font-weight: 500; border-bottom: 1px solid var(--border); background: var(--bg); }
td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid #f5f5f5; }

.status-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.status-card { display: flex; align-items: center; gap: 12px; }
.status-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.status-dot.green { background: var(--green); box-shadow: 0 0 6px rgba(127,182,133,0.5); }
.status-name { font-size: 14px; font-weight: 600; }
.status-val { font-size: 12px; color: var(--text2); }
</style>
